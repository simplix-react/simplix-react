import type { ConstraintMeta, FieldMeta, TypeRef } from "../types.js";
import type { ResolvedDomain, ResolvedType } from "../resolve.js";
import {
  camelJoin,
  entityModuleBase,
  HEADER,
  memberName,
  reachableFrom,
  responseRefs,
} from "./emit.js";
import { modelFileBase, type LabeledEnumMapping } from "./model-gen.js";

/** Directory the schema files land in, relative to a generated package's `src/generated/`. */
const SCHEMA_DIR = "schema";

/** Where the model declarations live, seen from a module of {@link SCHEMA_DIR}. */
const MODEL_DIR = "../model";

/**
 * The suffix every emitted constant carries.
 *
 * Orval names a constant per operation and role — `OrganizationRestCreateBody`,
 * `OrganizationRestGetResponse` — so one entity's twelve operations produce thirty-two of them.
 * SimpliX Meta is keyed by DTO, and a DTO is a body on one route and a response on another, so the
 * declaration belongs to the type rather than to any one operation.
 */
export function schemaConstName(typeName: string): string {
  return `${typeName}Schema`;
}

/**
 * The module one entity's schemas are declared in, without its extension.
 *
 * The `.schema` part is load-bearing. The CRUD scaffolder collects candidate files by **name** —
 * `schemas.ts`, `contract.ts`, `*.schema.ts` or `*.zod.ts` — and a file outside those four is
 * never opened. It then falls back to a placeholder field set with no warning, so a plain
 * `<entity>.ts` produces a scaffold that reports success and generates an `id`/`name` form.
 */
export function schemaFileBase(tag: string): string {
  return entityModuleBase(tag);
}

/** A schema that defers a reference through `z.lazy`, and the fields the deferral is on. */
export interface RecursiveSchema {
  type: string;
  fields: string[];
}

/** A `custom` constraint, which has no zod call and is therefore checked only by the server. */
export interface ServerOnlyConstraint {
  type: string;
  field: string;
  /** The annotation's simple name, as SimpliX Meta carries it. */
  name: string;
}

/**
 * A site where a type variable was erased to `z.unknown()`. A zod constant is a value rather than
 * a declaration, so it has nowhere to carry the generic parameter its model interface declares.
 */
export interface ErasedTypeParam {
  type: string;
  field: string;
  param: string;
}

/**
 * A field a type redeclares over its ancestor's with a different shape. `.extend()` keeps the
 * child's, which is what the model does too — but a narrowing nobody asked for is worth saying
 * out loud rather than applying quietly.
 */
export interface DivergentOverride {
  type: string;
  field: string;
  /** The ancestor the field was first declared on. */
  inherited: string;
}

export interface SchemaGenResult {
  /** Path relative to `src/generated/` → file content. */
  files: Map<string, string>;
  /** The emitted modules in the order they have to be evaluated, without their extension. */
  order: string[];
  recursiveSchemas: RecursiveSchema[];
  serverOnlyConstraints: ServerOnlyConstraint[];
  erasedTypeParams: ErasedTypeParam[];
  divergentOverrides: DivergentOverride[];
  /**
   * Entity modules that reach each other. Their references are deferred through `z.lazy` so the
   * cycle loads, but a closure split this way is worth looking at.
   */
  moduleCycles: string[][];
}

export interface SchemaGenOptions {
  /**
   * The same mapping the model generator is given, and used for the same decision: with it, a
   * labeled enum on the response side is the `{ value, label }` object the backend sends; without
   * it, both sides are the value union. Only its presence is read here — a zod schema spells the
   * object out structurally rather than importing a type.
   */
  labeledEnum?: LabeledEnumMapping;
}

/**
 * Emit one zod module per entity of a domain closure, plus the barrel over them.
 *
 * A zod constant is evaluated at module load, so unlike an `interface` it cannot reference a
 * declaration written below it: `Parent.extend({…})` and a field naming another schema both read
 * their target immediately. Every module and every declaration inside one is therefore ordered by
 * dependency, and a reference that closes a cycle is deferred through `z.lazy`.
 */
export function generateSchemaFiles(
  domain: ResolvedDomain,
  options: SchemaGenOptions = {},
): SchemaGenResult {
  const layout = new SchemaLayout(domain);
  const emitter = new SchemaEmitter(
    domain,
    layout,
    reachableFrom(domain, responseRefs(domain)),
    options.labeledEnum,
  );

  const files = new Map<string, string>();
  for (const base of layout.fileOrder) {
    files.set(`${SCHEMA_DIR}/${base}.schema.ts`, emitter.entityFile(base));
  }
  files.set(`${SCHEMA_DIR}/index.ts`, emitter.barrel());

  return {
    files,
    order: layout.fileOrder,
    recursiveSchemas: emitter.recursiveSchemas,
    serverOnlyConstraints: emitter.serverOnlyConstraints,
    erasedTypeParams: emitter.erasedTypeParams,
    divergentOverrides: collectDivergentOverrides(domain),
    moduleCycles: layout.moduleCycles,
  };
}

/** One dependency of a declaration, and whether it is the one `.extend()` reads. */
interface Dependency {
  name: string;
  heritage: boolean;
}

/**
 * Which module each declaration lands in, what order the modules and their declarations are
 * written in, and which references have to be deferred for that order to exist at all.
 */
class SchemaLayout {
  readonly fileOrder: string[] = [];
  readonly moduleCycles: string[][] = [];
  private readonly fileOfType = new Map<string, string>();
  private readonly typesByFile = new Map<string, ResolvedType[]>();
  private readonly deferred = new Set<string>();

  constructor(private readonly domain: ResolvedDomain) {
    const bases = entityFileBases(domain);
    for (const type of domain.types.values()) {
      const base = bases.get(type.owner) ?? schemaFileBase(type.owner);
      this.fileOfType.set(type.name, base);
      const declared = this.typesByFile.get(base);
      if (declared) declared.push(type);
      else this.typesByFile.set(base, [type]);
    }

    this.orderFiles();
    this.orderDeclarations();
  }

  fileOf(typeName: string): string | undefined {
    return this.fileOfType.get(typeName);
  }

  typesOf(base: string): ResolvedType[] {
    return this.typesByFile.get(base) ?? [];
  }

  /** Whether the reference from `owner` to `dependency` is the one that closes a cycle. */
  isDeferred(owner: string, dependency: string): boolean {
    return this.deferred.has(edgeKey(owner, dependency));
  }

  /**
   * Modules in evaluation order. A module cycle is broken by deferring every type reference that
   * crosses the closing edge, which is safe because the deferral is a closure the importer only
   * calls once both modules have finished evaluating.
   */
  private orderFiles(): void {
    const edges = new Map<string, Map<string, Dependency[]>>();
    for (const type of this.domain.types.values()) {
      const from = this.fileOfType.get(type.name);
      if (from === undefined) continue;
      const targets = edges.get(from) ?? new Map<string, Dependency[]>();
      edges.set(from, targets);
      for (const dependency of this.dependenciesOf(type)) {
        const to = this.fileOfType.get(dependency.name);
        if (to === undefined || to === from) continue;
        const crossing = targets.get(to) ?? [];
        crossing.push({ name: type.name, heritage: dependency.heritage });
        targets.set(to, crossing);
      }
    }

    const state = new Map<string, "open" | "closed">();
    const stack: string[] = [];

    const visit = (base: string): void => {
      state.set(base, "open");
      stack.push(base);
      for (const [target, crossing] of edges.get(base) ?? []) {
        if (state.get(target) === "open") {
          this.moduleCycles.push([...stack.slice(stack.indexOf(target)), target]);
          for (const type of crossing) this.defer(type.name, target, type.heritage);
          continue;
        }
        if (!state.has(target)) visit(target);
      }
      stack.pop();
      state.set(base, "closed");
      this.fileOrder.push(base);
    };

    for (const base of [...this.typesByFile.keys()].sort()) {
      if (!state.has(base)) visit(base);
    }
  }

  /** Declarations inside one module, in the same dependency order the modules are in. */
  private orderDeclarations(): void {
    for (const [base, declared] of this.typesByFile) {
      const byName = new Map(declared.map((type) => [type.name, type]));
      const state = new Map<string, "open" | "closed">();
      const ordered: ResolvedType[] = [];

      const visit = (type: ResolvedType): void => {
        state.set(type.name, "open");
        for (const dependency of this.dependenciesOf(type)) {
          const target = byName.get(dependency.name);
          if (!target) continue;
          if (state.get(target.name) === "open") {
            this.defer(type.name, target.name, dependency.heritage);
            continue;
          }
          if (!state.has(target.name)) visit(target);
        }
        state.set(type.name, "closed");
        ordered.push(type);
      };

      for (const type of declared) {
        if (!state.has(type.name)) visit(type);
      }
      this.typesByFile.set(base, ordered);
    }
  }

  /** The declarations one type's own body reads: its parent first, then its fields' references. */
  private dependenciesOf(type: ResolvedType): Dependency[] {
    const found: Dependency[] = [];
    const seen = new Set<string>();
    const add = (name: string, heritage: boolean): void => {
      if (seen.has(name) || !this.domain.types.has(name)) return;
      seen.add(name);
      found.push({ name, heritage });
    };

    // The parent goes first so a mixed cycle closes on a field reference, which `z.lazy` can
    // defer, rather than on the heritage clause, which nothing can.
    if (type.meta.extends) add(type.meta.extends, true);
    for (const field of type.meta.fields) {
      for (const name of referencedTypes(field.type)) add(name, false);
    }
    return found;
  }

  private defer(owner: string, dependency: string, heritage: boolean): void {
    if (heritage) {
      throw new Error(
        `Cannot order the schema for ${owner}: it extends ${dependency}, which reaches ` +
          `${owner} again. A heritage clause is read while the constant is built, so the cycle ` +
          "has no reference that z.lazy could defer.",
      );
    }
    this.deferred.add(edgeKey(owner, dependency));
  }
}

/**
 * Tag → module base, with a collision resolved by spelling the whole tag out. Two tags of one
 * domain ending in the same word would otherwise write one file twice, and the entity written
 * first would leave the package without a single one of its schemas.
 */
function entityFileBases(domain: ResolvedDomain): Map<string, string> {
  const bases = new Map<string, string>();
  const taken = new Map<string, number>();
  for (const entity of domain.entities) {
    const base = schemaFileBase(entity.tag);
    taken.set(base, (taken.get(base) ?? 0) + 1);
  }
  for (const entity of domain.entities) {
    const base = schemaFileBase(entity.tag);
    bases.set(entity.tag, (taken.get(base) ?? 0) > 1 ? camelJoin(entity.tag) : base);
  }

  const owners = new Map<string, string>();
  for (const [tag, base] of bases) {
    const held = owners.get(base);
    if (held !== undefined) {
      throw new Error(
        `Tags '${held}' and '${tag}' both name the schema module '${base}'. One would overwrite ` +
          "the other, and the entity written first would reach the package with no schema at all.",
      );
    }
    owners.set(base, tag);
  }
  return bases;
}

function edgeKey(owner: string, dependency: string): string {
  return `${owner} ${dependency}`;
}

/** Every declared type a reference reads, a container's arguments and a subset's source included. */
function referencedTypes(ref: TypeRef): string[] {
  switch (ref.kind) {
    case "ref":
      return [ref.name, ...(ref.args ?? []).flatMap(referencedTypes)];
    case "container":
      return ref.args.flatMap(referencedTypes);
    case "pick":
      return [ref.of];
    default:
      return [];
  }
}

/** The names one module takes from elsewhere, gathered while its declarations are written. */
interface FileImports {
  /** Schema constants declared in another entity's module. */
  schemas: Set<string>;
  /** Model interfaces, which only a recursive schema needs, to annotate itself with. */
  models: Set<string>;
  /** Module specifier → the names taken from it, contributed by a container mapping. */
  external: Map<string, Set<string>>;
}

/** Where a reference is being written, and what the surrounding declaration binds. */
interface RenderSite {
  owner: ResolvedType;
  field: string;
  /** Module the declaration is being written into, so a reference to it imports nothing. */
  file: string;
  /** Whether a response carries this declaration, which decides a labeled enum's shape. */
  responseSide: boolean;
  imports: FileImports;
  /** Fields whose reference was deferred; a non-empty list makes the constant recursive. */
  deferred: string[];
}

class SchemaEmitter {
  readonly recursiveSchemas: RecursiveSchema[] = [];
  readonly serverOnlyConstraints: ServerOnlyConstraint[] = [];
  readonly erasedTypeParams: ErasedTypeParam[] = [];

  constructor(
    private readonly domain: ResolvedDomain,
    private readonly layout: SchemaLayout,
    private readonly responseTypes: ReadonlySet<string>,
    private readonly labeledEnum: LabeledEnumMapping | undefined,
  ) {}

  /** One entity's module: what it imports, then its declarations in dependency order. */
  entityFile(base: string): string {
    const imports: FileImports = { schemas: new Set(), models: new Set(), external: new Map() };
    const declarations = this.layout
      .typesOf(base)
      .map((type) => this.declaration(type, base, imports));
    return [HEADER, "", ...this.importLines(imports), ...declarations].join("\n");
  }

  /** The barrel, re-exporting the modules in the order they have to be evaluated. */
  barrel(): string {
    const exports = this.layout.fileOrder.map((base) => `export * from './${base}.schema';`);
    return [HEADER, "", ...exports, ""].join("\n");
  }

  private declaration(type: ResolvedType, file: string, imports: FileImports): string {
    const site: RenderSite = {
      owner: type,
      field: "",
      file,
      responseSide: this.responseTypes.has(type.name),
      imports,
      deferred: [],
    };

    // Only own fields: an inherited one is carried by the parent constant this one extends.
    const body: string[] = [];
    for (const field of type.meta.fields) {
      site.field = field.name;
      for (const constraint of field.constraints ?? []) {
        if (constraint.kind !== "custom") continue;
        const name = constraint.name ?? "custom";
        this.serverOnlyConstraints.push({ type: type.name, field: field.name, name });
        body.push(`  // Checked on the server only: ${name}.`);
      }
      body.push(`  ${memberName(field.name)}: ${this.member(field, site)},`);
    }

    // A generic parent's arguments are dropped with the parameters themselves: a constant has
    // nowhere to declare one, and the model generator already reports every such site.
    const parent = type.meta.extends;
    let open = "z.object({";
    if (parent !== undefined && this.domain.types.has(parent)) {
      if (this.layout.fileOf(parent) !== file) imports.schemas.add(parent);
      open = `${schemaConstName(parent)}.extend({`;
    }

    let annotation = "";
    if (site.deferred.length > 0) {
      this.recursiveSchemas.push({ type: type.name, fields: site.deferred });
      // TypeScript cannot infer the type of a schema that reads itself, and reports the constant
      // as implicitly `any`; the model interface is the annotation that breaks the recursion.
      imports.models.add(type.name);
      annotation = `: z.ZodType<${type.name}>`;
    }

    const declared = `export const ${schemaConstName(type.name)}${annotation} = ${open}`;
    if (body.length === 0) return `${declared}});\n`;
    return `${declared}\n${body.join("\n")}\n});\n`;
  }

  /** One field: its base type, the constraints on it, and whether it may be left out. */
  private member(field: FieldMeta, at: RenderSite): string {
    let expression = this.baseType(field, at);
    for (const constraint of field.constraints ?? []) {
      expression += this.check(constraint, at);
    }
    return field.required ? expression : `${expression}.optional()`;
  }

  /**
   * The type a value is parsed as. Three constraints replace it outright rather than adding a
   * check: an email is its own type in zod 4 — `z.string().email()` is deprecated there — and an
   * asserted boolean is the literal it is asserted to be.
   */
  private baseType(field: FieldMeta, at: RenderSite): string {
    for (const constraint of field.constraints ?? []) {
      if (constraint.kind === "email") return "z.email()";
      if (constraint.kind === "assertTrue") return "z.literal(true)";
      if (constraint.kind === "assertFalse") return "z.literal(false)";
    }
    return this.render(field.type, at);
  }

  private render(ref: TypeRef, at: RenderSite): string {
    switch (ref.kind) {
      case "string":
        return "z.string()";
      case "boolean":
        return "z.boolean()";
      case "unknown":
        return "z.unknown()";
      // A moment and a day arrive as ISO text, and the format is half of what the field means.
      case "instant":
        return "z.iso.datetime()";
      case "date":
        return "z.iso.date()";
      case "time":
        return `z.string().regex(new RegExp(${JSON.stringify(timeRegex(ref.pattern, at))}))`;
      case "file":
      case "binary":
        return "z.instanceof(Blob)";
      case "number":
        return ref.integral ? "z.int()" : "z.number()";
      case "enum":
        return this.renderEnum(ref.name, at);
      case "ref":
        return this.renderRef(ref.name, at);
      case "container":
        return this.renderContainer(ref.name, ref.args, at);
      case "pick": {
        const keys = ref.fields.map((name) => `${memberName(name)}: true`).join(", ");
        return `${this.renderRef(ref.of, at)}.pick({ ${keys} })`;
      }
      case "param":
        this.erasedTypeParams.push({ type: at.owner.name, field: at.field, param: ref.name });
        return "z.unknown()";
    }
  }

  /**
   * A labeled enum is the object the backend sends on every response and a bare value on a
   * request, so the side the declaration is carried on decides which of the two this is. The
   * values are written out at the site rather than shared through a constant, because the CRUD
   * scaffolder reads the literal `z.enum([…])` to build a select and its options, and an
   * identifier tells it nothing.
   */
  private renderEnum(name: string, at: RenderSite): string {
    const declared = this.domain.enums.get(name);
    // A name SimpliX Meta does not declare is already reported by the resolver.
    if (!declared) return "z.unknown()";

    const values = declared.meta.values.map((value) => `'${value.name}'`).join(", ");
    const union = `z.enum([${values}])`;
    const labeled = declared.meta.labeled && at.responseSide && this.labeledEnum !== undefined;
    return labeled ? `z.object({ value: ${union}, label: z.string() })` : union;
  }

  private renderRef(name: string, at: RenderSite): string {
    if (!this.domain.types.has(name)) return "z.unknown()";
    if (this.layout.fileOf(name) !== at.file) at.imports.schemas.add(name);

    const constant = schemaConstName(name);
    if (!this.layout.isDeferred(at.owner.name, name)) return constant;

    // The constant is not bound yet at this point of the module's evaluation, so the reference
    // is a closure the parser calls once it is.
    if (!at.deferred.includes(at.field)) at.deferred.push(at.field);
    return `z.lazy(() => ${constant})`;
  }

  private renderContainer(name: string, args: TypeRef[], at: RenderSite): string {
    const mapping = this.domain.containers.get(name);
    const rendered = args.map((arg) => this.render(arg, at));
    const inner = rendered.length > 0 ? rendered : ["z.unknown()"];
    // An unmapped container is reported by the resolver, and the envelope is stripped before the
    // client ever sees it; either way the value parsed is what the container holds.
    if (!mapping?.zod || mapping.unwrap) return inner[0];

    if (mapping.import) {
      const names = at.imports.external.get(mapping.import) ?? new Set<string>();
      names.add(mapping.zod);
      at.imports.external.set(mapping.import, names);
    }

    // `z.record` takes the key schema as well, and SimpliX Meta carries only the value: a Java `Map`
    // has string keys once JSON has serialized it, which is what the profile's `keyType` says.
    // The one-argument call does not merely skip validation — it throws while the schema is
    // being built, so a module holding one never loads at all.
    if (mapping.keyType) return `${mapping.zod}(${keySchema(mapping.keyType)}, ${inner.join(", ")})`;
    return `${mapping.zod}(${inner.join(", ")})`;
  }

  /** One jakarta constraint as the zod call that enforces it. */
  private check(constraint: ConstraintMeta, at: RenderSite): string {
    const site = `${at.owner.name}.${at.field}`;
    switch (constraint.kind) {
      // Already applied to the base type, which is what these three change.
      case "email":
      case "assertTrue":
      case "assertFalse":
        return "";
      // `@NotBlank` rejects whitespace, so the value is trimmed before its length is read.
      case "notBlank":
        return ".trim().min(1)";
      case "notEmpty":
        return ".min(1)";
      case "minLength":
      case "minItems":
      case "min":
        return `.min(${bound(constraint, site)})`;
      case "maxLength":
      case "maxItems":
      case "max":
        return `.max(${bound(constraint, site)})`;
      case "positive":
      case "nonnegative":
      case "negative":
      case "nonpositive":
        return `.${constraint.kind}()`;
      case "pattern":
        return `.regex(new RegExp(${JSON.stringify(text(constraint, site))}))`;
      // Reported and commented where the field is written: the check is the server's own code.
      case "custom":
        return "";
      default:
        throw new Error(
          `Unrecognised constraint kind '${constraint.kind}' on ${site}. SimpliX Meta's vocabulary is ` +
            "closed, so a new kind is a backend change that this generator has to be taught.",
        );
    }
  }

  private importLines(imports: FileImports): string[] {
    const lines = ["import { z } from 'zod';"];
    for (const [module, names] of [...imports.external.entries()].sort(byModule)) {
      lines.push(`import { ${[...names].sort().join(", ")} } from '${module}';`);
    }
    for (const name of [...imports.models].sort()) {
      lines.push(`import type { ${name} } from '${MODEL_DIR}/${modelFileBase(name)}';`);
    }
    for (const name of [...imports.schemas].sort()) {
      const base = this.layout.fileOf(name);
      lines.push(`import { ${schemaConstName(name)} } from './${base}.schema';`);
    }
    lines.push("");
    return lines;
  }
}

function byModule(left: [string, unknown], right: [string, unknown]): number {
  return left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0;
}

/** The key schema of a mapped `Map`, spelled from the TypeScript key type the profile names. */
function keySchema(keyType: string): string {
  return keyType === "number" ? "z.number()" : "z.string()";
}

/**
 * A numeric bound. `@Min`/`@Max` send a JSON number and `@DecimalMin`/`@DecimalMax` a JSON string
 * of an arbitrary-precision decimal under the same kind, so the wire type says which annotation
 * it was and neither reaches zod without being read as a number.
 */
function bound(constraint: ConstraintMeta, site: string): number {
  const value = Number(constraint.value);
  if (constraint.value === undefined || Number.isNaN(value)) {
    throw new Error(
      `Constraint '${constraint.kind}' on ${site} carries no numeric value: ` +
        `${JSON.stringify(constraint.value)}.`,
    );
  }
  return value;
}

function text(constraint: ConstraintMeta, site: string): string {
  if (typeof constraint.value !== "string" || constraint.value === "") {
    throw new Error(
      `Constraint '${constraint.kind}' on ${site} carries no pattern: ` +
        `${JSON.stringify(constraint.value)}.`,
    );
  }
  return constraint.value;
}

/** What each field of a Java time format stands for, longest form first. */
const TIME_TOKENS: Record<string, string> = {
  H: "([01]?\\d|2[0-3])",
  HH: "([01]\\d|2[0-3])",
  m: "[0-5]?\\d",
  mm: "[0-5]\\d",
  s: "[0-5]?\\d",
  ss: "[0-5]\\d",
  S: "\\d",
  SS: "\\d{2}",
  SSS: "\\d{3}",
};

/**
 * The regular expression a clock time is checked against.
 *
 * SimpliX Meta carries a **format** here — `HH:mm` — not a pattern, so handing it to `RegExp` unchanged
 * would build a schema that accepts only the literal text `HH:mm`.
 */
function timeRegex(pattern: string | undefined, at: RenderSite): string {
  const format = pattern ?? "HH:mm";
  let source = "^";
  for (const token of format.match(/([A-Za-z])\1*|[^A-Za-z]/g) ?? []) {
    const known = TIME_TOKENS[token];
    if (known !== undefined) {
      source += known;
    } else if (/[A-Za-z]/.test(token)) {
      throw new Error(
        `Unrecognised time format field '${token}' in '${format}' on ` +
          `${at.owner.name}.${at.field}.`,
      );
    } else {
      source += token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  }
  return `${source}$`;
}

/**
 * Fields a type redeclares over an ancestor's with a different shape. An identical redeclaration
 * is what the capture holds and needs nothing: `.extend()` keeps the child's, exactly as the
 * model's `interface … extends` does.
 *
 * A parameter the ancestor declares generically and the child fills in is not a divergence — it
 * is the generic being instantiated, and the erased `z.unknown()` is what the child narrows.
 */
function collectDivergentOverrides(domain: ResolvedDomain): DivergentOverride[] {
  const found: DivergentOverride[] = [];
  for (const type of domain.types.values()) {
    for (const field of type.meta.fields) {
      for (const ancestor of type.ancestors) {
        const declared = domain.types.get(ancestor)?.meta.fields.find((f) => f.name === field.name);
        if (!declared) continue;
        if (
          declared.type.kind !== "param" &&
          (JSON.stringify(declared.type) !== JSON.stringify(field.type) ||
            declared.required !== field.required)
        ) {
          found.push({ type: type.name, field: field.name, inherited: ancestor });
        }
        break;
      }
    }
  }
  return found;
}
