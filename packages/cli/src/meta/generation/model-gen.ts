import type { FieldMeta, TypeRef } from "../types.js";
import type { ResolvedDomain, ResolvedType } from "../resolve.js";
import {
  containerTypeExpression,
  ENUM_MODULE,
  enumTonesName,
  fieldFormatsName,
  HEADER,
  memberName,
  PRIMITIVES,
  reachableFrom,
  requestRefs,
  responseRefs,
  STATUS_TONE_MODULE,
} from "./emit.js";

/** Directory the model files land in, relative to a generated package's `src/generated/`. */
const MODEL_DIR = "model";

/** How a labeled enum's `{ value, label }` response shape is spelled, and where that type lives. */
export interface LabeledEnumMapping {
  /** The generic type wrapping an enum value with its label. */
  ts: string;
  /** Module the type is imported from. */
  import: string;
}

export interface ModelGenOptions {
  /**
   * Contributed by the spec profile, because the type belongs to the backend adapter rather than
   * to the CLI. Without it a labeled enum is emitted as its value union in both directions, which
   * is what a backend that does not label its enums produces anyway.
   */
  labeledEnum?: LabeledEnumMapping;
}

/** A `param` reference naming a type variable the owning declaration does not declare. */
export interface UnboundTypeParam {
  type: string;
  field: string;
  /** The variable as SimpliX Meta spells it, which is the collection's own `E` for a raw Java `List`. */
  param: string;
}

/** A generic type named with no type arguments, so every parameter was filled with `unknown`. */
export interface FilledTypeArguments {
  /** Where the name is written - `SomeDTO.someField`, or `Child extends` for a heritage clause. */
  site: string;
  target: string;
  params: string[];
}

/**
 * A type both a response and a request reach. Its labeled enum fields are emitted in the response
 * shape, since that is the only shape a response ever carries and the backend's deserializer takes
 * the same object back on a request; a request-shaped union would be a falsehood on every read.
 */
export interface DualDirectionType {
  name: string;
  /** The labeled enums it carries, which are the fields the choice applies to. */
  enums: string[];
}

/**
 * A declaration table (`<Enum>Tones`, `<Type>FieldFormats`) left out because a type or an enum of
 * the domain is already exported under its name.
 */
export interface ShadowedDeclaration {
  /** The name the table would have been exported under. */
  name: string;
  /** The enum or type whose declarations the table would have carried. */
  of: string;
}

export interface ModelGenResult {
  /** Path relative to `src/generated/` → file content. */
  files: Map<string, string>;
  unboundTypeParams: UnboundTypeParam[];
  filledTypeArguments: FilledTypeArguments[];
  dualDirectionTypes: DualDirectionType[];
  shadowedDeclarations: ShadowedDeclaration[];
}

/**
 * The module a type is declared in, without its extension. Only the initial is lowered and the
 * rest of the name is left alone, so `OrganizationListDTO` lands in `organizationListDTO.ts`.
 *
 * The rule is not cosmetic: the CRUD scaffolder builds the same path from a list DTO's name to
 * read which fields the list projection returns, and a directory organised any other way makes it
 * read nothing - every field of the form DTO then becomes a list column.
 */
export function modelFileBase(typeName: string): string {
  return typeName.charAt(0).toLowerCase() + typeName.slice(1);
}

/**
 * Emit one TypeScript declaration file per DTO type of a domain closure, the module holding its
 * enums, and the barrel over both.
 *
 * One type per file is what makes a shared declaration land exactly once: a type two entities of
 * the domain reach has one file whichever of them was walked first, so the barrel's `export *`
 * cannot collide.
 */
export function generateModelFiles(
  domain: ResolvedDomain,
  options: ModelGenOptions = {},
): ModelGenResult {
  const responseTypes = reachableFrom(domain, responseRefs(domain));
  const requestTypes = reachableFrom(domain, requestRefs(domain));
  const emitter = new ModelEmitter(domain, responseTypes, options.labeledEnum);

  const files = new Map<string, string>();
  for (const type of domain.types.values()) {
    files.set(`${MODEL_DIR}/${modelFileBase(type.name)}.ts`, emitter.typeFile(type));
  }
  files.set(`${MODEL_DIR}/${ENUM_MODULE}.ts`, emitter.enumFile());
  files.set(`${MODEL_DIR}/index.ts`, emitter.barrel());

  return {
    files,
    unboundTypeParams: emitter.unboundTypeParams,
    filledTypeArguments: emitter.filledTypeArguments,
    dualDirectionTypes: collectDualDirection(domain, responseTypes, requestTypes),
    shadowedDeclarations: emitter.shadowedDeclarations,
  };
}

/** The names one file takes from elsewhere, gathered while its declaration is written. */
interface FileImports {
  /** Model types, each of which lives in a module of its own. */
  types: Set<string>;
  /** Enum names and labeled aliases, all of which live in the enum module. */
  enums: Set<string>;
  /** Module specifier → the names taken from it. */
  external: Map<string, Set<string>>;
}

/** Where a reference is being written, and what the surrounding declaration binds. */
interface RenderSite {
  /** The type whose declaration is being written; its `typeParams` bind a `param` reference. */
  owner: ResolvedType;
  /** The field being written, named in a report. */
  field: string;
  /** Whether a response carries this declaration, which decides a labeled enum's shape. */
  responseSide: boolean;
  imports: FileImports;
}

class ModelEmitter {
  readonly unboundTypeParams: UnboundTypeParam[] = [];
  readonly filledTypeArguments: FilledTypeArguments[] = [];
  readonly shadowedDeclarations: ShadowedDeclaration[] = [];

  constructor(
    private readonly domain: ResolvedDomain,
    private readonly responseTypes: ReadonlySet<string>,
    private readonly labeledEnum: LabeledEnumMapping | undefined,
  ) {}

  /** One type's module: what it imports, then the single interface it declares. */
  typeFile(type: ResolvedType): string {
    const imports: FileImports = { types: new Set(), enums: new Set(), external: new Map() };
    const site: RenderSite = {
      owner: type,
      field: "",
      responseSide: this.responseTypes.has(type.name),
      imports,
    };

    // Only own fields: an inherited one is declared by the ancestor this interface extends.
    const body: string[] = [];
    for (const field of type.meta.fields) {
      site.field = field.name;
      const description = jsDoc(field.description);
      if (description) body.push(`  ${description}`);
      body.push(`  ${field.name}${field.required ? "" : "?"}: ${this.render(field.type, site)};`);
    }

    const heritage = this.heritage(type, imports);
    const params = type.meta.typeParams.length ? `<${type.meta.typeParams.join(", ")}>` : "";
    // A type reaching itself imports nothing: the declaration is in this very file.
    imports.types.delete(type.name);

    const declaration = jsDoc(type.meta.description);
    const lines = [HEADER, "", ...importLines(imports)];
    if (declaration) lines.push(declaration);
    lines.push(
      body.length === 0
        ? `export interface ${type.name}${params}${heritage} {}`
        : `export interface ${type.name}${params}${heritage} {\n${body.join("\n")}\n}`,
      "",
    );
    lines.push(...this.fieldFormats(type));
    return lines.join("\n");
  }

  /**
   * The format SimpliX Meta declares on each field of the type (money with its currency and
   * scale, credits, an excerpt, bytes, a duration, a code), inherited fields included because a
   * reader holds the concrete type. A type none of whose fields declares one gets no table.
   */
  private fieldFormats(type: ResolvedType): string[] {
    const entries = type.allFields
      .map((field) => [field, formatEntry(field)] as const)
      .filter((pair): pair is readonly [FieldMeta, string] => pair[1] !== undefined)
      .map(([field, entry]) => `  ${memberName(field.name)}: ${entry},`);
    if (entries.length === 0) return [];

    const name = fieldFormatsName(type.name);
    if (this.isTaken(name)) {
      this.shadowedDeclarations.push({ name, of: type.name });
      return [];
    }
    return [
      "/** The format SimpliX Meta declares on each field that has one, inherited fields included. */",
      `export const ${name} = {`,
      ...entries,
      "} as const;",
      "",
    ];
  }

  /** Whether a type or an enum of the domain is already exported under the name. */
  private isTaken(name: string): boolean {
    return this.domain.types.has(name) || this.domain.enums.has(name);
  }

  /**
   * The tone each value of an enum is drawn in, where SimpliX Meta declares any. Typed partial,
   * since a declaration may leave values out, so a reader writes its own fallback
   * (`<Enum>Tones[value] ?? "neutral"`) and a tone outside the vocabulary fails to compile here.
   */
  private enumTones(name: string, values: readonly { name: string; tone?: string }[]): string[] {
    const toned = values.filter((value) => value.tone !== undefined);
    if (toned.length === 0) return [];

    const tonesName = enumTonesName(name);
    if (this.isTaken(tonesName)) {
      this.shadowedDeclarations.push({ name: tonesName, of: name });
      return [];
    }
    return [
      "/** The status tone SimpliX Meta declares for each value; a value left out declares none. */",
      `export const ${tonesName}: Readonly<Partial<Record<${name}, StatusTone>>> = {`,
      ...toned.map((value) => `  ${memberName(value.name)}: ${quoted(value.tone ?? "")},`),
      "};",
      "",
    ];
  }

  /**
   * Every enum of the domain, each as the type and the const that share one name. The pair is a
   * declaration merge, so the name works where a type is expected and where a value is.
   */
  enumFile(): string {
    const declared = [...this.domain.enums.values()];
    const lines = [HEADER, ""];

    // A domain whose closure reaches no enum still gets the module, because the barrel re-exports
    // it unconditionally and a file holding only a comment is not a module - TypeScript rejects
    // the re-export with TS2306 rather than ignoring it, and the domain package stops compiling.
    if (declared.length === 0) {
      lines.push("export {};", "");
      return lines.join("\n");
    }

    if (this.labeledEnum && declared.some((entry) => entry.meta.labeled)) {
      lines.push(
        `import type { ${this.labeledEnum.ts} } from '${this.labeledEnum.import}';`,
        "",
      );
    }
    const tables = new Map(
      declared.map((entry) => [entry.name, this.enumTones(entry.name, entry.meta.values)]),
    );
    if ([...tables.values()].some((table) => table.length > 0)) {
      lines.push(`import type { StatusTone } from '${STATUS_TONE_MODULE}';`, "");
    }

    for (const entry of declared) {
      const values = entry.meta.values.map((value) => `  ${value.name}: '${value.name}',`);
      lines.push(
        `export type ${entry.name} = typeof ${entry.name}[keyof typeof ${entry.name}];`,
        "",
        "",
        `export const ${entry.name} = {`,
        ...values,
        "} as const;",
        "",
      );
      if (this.labeledEnum && entry.meta.labeled) {
        lines.push(
          "/** The shape a response field carries: the value with the label it is shown under. */",
          `export type ${entry.name}Labeled = ${this.labeledEnum.ts}<${entry.name}>;`,
          "",
        );
      }
      lines.push(...(tables.get(entry.name) ?? []));
    }

    return lines.join("\n");
  }

  /** The barrel over the directory, which every module of it is reachable through. */
  barrel(): string {
    const modules = [ENUM_MODULE, ...[...this.domain.types.keys()].map(modelFileBase)].sort();
    return [HEADER, "", ...modules.map((name) => `export * from './${name}';`), ""].join("\n");
  }

  private render(ref: TypeRef, at: RenderSite): string {
    switch (ref.kind) {
      case "number":
        return "number";
      case "enum":
        return this.renderEnum(ref.name, at);
      case "ref":
        return this.renderRef(ref.name, ref.args, at);
      case "container":
        return this.renderContainer(ref.name, ref.args, at);
      case "pick": {
        const of = this.renderRef(ref.of, undefined, at);
        const keys = ref.fields.map((name) => `'${name}'`).join(" | ");
        return `Pick<${of}, ${keys === "" ? "never" : keys}>`;
      }
      case "param":
        return this.renderParam(ref.name, at);
      default:
        return PRIMITIVES[ref.kind];
    }
  }

  /**
   * A labeled enum is an object on every response and a bare string on a request, so the side the
   * declaration is carried on decides which of the two the field is.
   */
  private renderEnum(name: string, at: RenderSite): string {
    const declared = this.domain.enums.get(name);
    // A name SimpliX Meta does not declare is already reported by the resolver; importing it here would
    // point at a module this generator never writes.
    if (!declared) return "unknown";

    const labeled = declared.meta.labeled && at.responseSide && this.labeledEnum !== undefined;
    const used = labeled ? `${name}Labeled` : name;
    at.imports.enums.add(used);
    return used;
  }

  private renderRef(name: string, args: TypeRef[] | undefined, at: RenderSite): string {
    const target = this.domain.types.get(name);
    if (!target) return "unknown";
    at.imports.types.add(name);
    return `${name}${this.typeArguments(target, args, `${at.owner.name}.${at.field}`, at)}`;
  }

  private typeArguments(
    target: ResolvedType,
    given: TypeRef[] | undefined,
    site: string,
    at: RenderSite,
  ): string {
    const params = target.meta.typeParams;
    if (params.length === 0) return "";
    if (given && given.length === params.length) {
      return `<${given.map((arg) => this.render(arg, at)).join(", ")}>`;
    }

    // The reference carries no argument, so nothing here says what the parameter stands for.
    this.filledTypeArguments.push({ site, target: target.name, params: [...params] });
    return `<${params.map(() => "unknown").join(", ")}>`;
  }

  private renderContainer(name: string, args: TypeRef[], at: RenderSite): string {
    const mapping = this.domain.containers.get(name);
    const rendered = args.map((arg) => this.render(arg, at));
    // An unmapped container is reported by the resolver; it has no client type to name.
    if (!mapping) return "unknown";

    const external = (module: string, ts: string): void => {
      const names = at.imports.external.get(module) ?? new Set<string>();
      names.add(ts);
      at.imports.external.set(module, names);
    };
    return containerTypeExpression(mapping, rendered, external) ?? rendered[0] ?? "unknown";
  }

  private renderParam(name: string, at: RenderSite): string {
    if (at.owner.meta.typeParams.includes(name)) return name;

    // A raw `List` in Java resolves its element to the collection's own variable, so the name
    // arriving here is bound to nothing this declaration can spell. Emitting it would put an
    // undeclared identifier in the output; `unknown` compiles and says exactly as much as the
    // backend does.
    this.unboundTypeParams.push({ type: at.owner.name, field: at.field, param: name });
    return "unknown";
  }

  private heritage(type: ResolvedType, imports: FileImports): string {
    const parentName = type.meta.extends;
    if (!parentName) return "";
    const parent = this.domain.types.get(parentName);
    if (!parent) return "";

    imports.types.add(parentName);
    const params = parent.meta.typeParams;
    if (params.length === 0) return ` extends ${parentName}`;

    // A `TypeMeta` has nowhere to carry the arguments an `extends` clause supplies, so the child's
    // own parameter list is the only reading available: one of the same length is being passed
    // straight up, as `BaseEntity<K> extends SimpliXBaseEntity<K>` does.
    if (type.meta.typeParams.length === params.length) {
      return ` extends ${parentName}<${type.meta.typeParams.join(", ")}>`;
    }

    this.filledTypeArguments.push({
      site: `${type.name} extends`,
      target: parentName,
      params: [...params],
    });
    return ` extends ${parentName}<${params.map(() => "unknown").join(", ")}>`;
  }
}

function importLines(imports: FileImports): string[] {
  const lines: string[] = [];
  for (const [module, names] of [...imports.external.entries()].sort(byName)) {
    lines.push(`import type { ${[...names].sort().join(", ")} } from '${module}';`);
  }
  if (imports.enums.size > 0) {
    lines.push(`import type { ${[...imports.enums].sort().join(", ")} } from './${ENUM_MODULE}';`);
  }
  for (const name of [...imports.types].sort()) {
    lines.push(`import type { ${name} } from './${modelFileBase(name)}';`);
  }
  if (lines.length > 0) lines.push("");
  return lines;
}

function byName(left: [string, unknown], right: [string, unknown]): number {
  return left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0;
}

/** A string literal in the quote style the generated modules use. */
function quoted(text: string): string {
  return `'${text.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

/**
 * The literal one field contributes to its type's format table, or nothing when it declares no
 * format and no money. Only what SimpliX Meta declares is written: `format`, and `money` with
 * its currency and scale.
 */
function formatEntry(field: FieldMeta): string | undefined {
  const parts: string[] = [];
  if (field.format !== undefined) parts.push(`format: ${quoted(field.format)}`);
  if (field.money !== undefined) {
    parts.push(
      `money: { currency: ${quoted(field.money.currency)}, scale: ${Number(field.money.scale)} }`,
    );
  }
  return parts.length === 0 ? undefined : `{ ${parts.join(", ")} }`;
}

/** One line, and never a sequence that would close the comment early. */
function jsDoc(text: string | undefined): string {
  if (!text) return "";
  const oneLine = text.replace(/\s+/g, " ").replace(/\*\//g, "*\\/").trim();
  return oneLine === "" ? "" : `/** ${oneLine} */`;
}

function collectDualDirection(
  domain: ResolvedDomain,
  responseTypes: ReadonlySet<string>,
  requestTypes: ReadonlySet<string>,
): DualDirectionType[] {
  const dual: DualDirectionType[] = [];
  for (const type of domain.types.values()) {
    if (!responseTypes.has(type.name) || !requestTypes.has(type.name)) continue;
    const enums = new Set<string>();
    for (const field of type.meta.fields) {
      for (const name of labeledEnumsOf(field.type, domain)) enums.add(name);
    }
    if (enums.size > 0) dual.push({ name: type.name, enums: [...enums] });
  }
  return dual;
}

/** The labeled enums a field carries, a container's element type included. */
function labeledEnumsOf(ref: TypeRef, domain: ResolvedDomain): string[] {
  if (ref.kind === "enum") {
    return domain.enums.get(ref.name)?.meta.labeled === true ? [ref.name] : [];
  }
  if (ref.kind === "container") {
    return ref.args.flatMap((arg) => labeledEnumsOf(arg, domain));
  }
  return [];
}
