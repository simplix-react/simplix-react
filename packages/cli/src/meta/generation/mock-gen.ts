import { toPascalCase } from "../../utils/case.js";
import type { OpenApiNamingStrategy } from "../../openapi/naming/naming-strategy.js";
import { readSearchFields, type SearchField } from "../filter-source.js";
import type { FieldMeta, ParamMeta, TypeRef } from "../ir-types.js";
import type { ResolvedDomain, ResolvedType } from "../resolve.js";
import { HEADER, innermostRef, payloadOf, reachableFrom, refNameOf, responseRefs } from "./emit.js";
import { entityNameOf, resolveEndpoints, type EndpointTarget } from "./endpoint-gen.js";
import type { LabeledEnumMapping } from "./model-gen.js";

/** Directory the handler module lands in, relative to a generated package's meta output root. */
export const MOCK_DIR = "mock";

/** Where the model declarations live, seen from a module of {@link MOCK_DIR}. */
const MODEL_DIR = "../model";

/** The meta output root, seen from `src/mock/` — where the entry and the seeds are written. */
const DEFAULT_META_ROOT = "../generated-meta";

/** Rows per seed array. */
const SEED_COUNT = 20;

/**
 * The roles whose handler reads or writes the store. An entity with none of them answers from
 * nothing, so it is given neither a store nor a seed array.
 */
const CRUD_STORE_ROLES = new Set([
  "list",
  "getAll",
  "search",
  "get",
  "create",
  "update",
  "delete",
  "batchDelete",
  "batchUpdate",
  "multiUpdate",
  "getForEdit",
  "tree",
  "subtree",
  "order",
]);

/**
 * Section markers of the generated `src/mock/index.ts`. The two are the same text the OpenAPI
 * pipeline writes, so an entry written by either path is recognised by both and a package that
 * migrates from one to the other keeps whatever overrides it holds.
 */
export const MOCK_OVERRIDE_MARKER =
  "// Add custom handler overrides here (placed before generated handlers)";
export const MOCK_GENERATED_MARKER = "// Generated handlers";

/**
 * Whether an existing `src/mock/index.ts` may be rewritten: both markers are present and the
 * region between them — where a developer adds handler overrides — is empty.
 *
 * A file missing either marker is left alone, which is also why {@link generateMockFiles} always
 * emits both: an entry written without them is frozen at its first version and never picks up an
 * entity added later.
 */
export function canRegenerateMockEntry(content: string): boolean {
  const start = content.indexOf(MOCK_OVERRIDE_MARKER);
  const end = content.indexOf(MOCK_GENERATED_MARKER);
  if (start === -1 || end === -1 || end <= start) return false;
  return content.slice(start + MOCK_OVERRIDE_MARKER.length, end).trim() === "";
}

/** What wraps a mock response body, contributed by the spec profile's response adapter. */
export interface EnvelopeMapping {
  /** The function name, applied to every body the handlers answer with. */
  wrap: string;
  /** Module the function is imported from. */
  import: string;
}

export interface MockGenOptions {
  /** The wrapper the model spells a labeled enum with; absent, a seed carries the bare value. */
  labeledEnum?: LabeledEnumMapping;
  /** Contributed by the spec profile, and the same one the endpoints were generated with. */
  naming: OpenApiNamingStrategy;
  /**
   * Without it the handlers answer with the bare body, which is what a backend that does not
   * wrap its responses returns anyway.
   */
  envelope?: EnvelopeMapping;
  /** The meta output root seen from `src/mock/`. Defaults to `../generated-meta`. */
  metaRoot?: string;
}

/** An entity that answers from a store, and the DTO no rule in the IR named for it. */
export interface UnresolvedStoreType {
  tag: string;
  /** The roles that would have read the store, which is why the entity needed a type at all. */
  roles: string[];
}

/** A reorder operation whose body names no field to write. */
export interface UnresolvedOrderField {
  tag: string;
  operation: string;
}

/**
 * A route identified by a path parameter the store's DTO does not declare, so nothing in the
 * store can be matched against it. The handler answers with the whole list rather than with one
 * arbitrary row.
 */
export interface UnmatchableParameter {
  tag: string;
  operation: string;
  parameter: string;
  /** The DTO the store is typed with, which is the shape the filter would have read. */
  storeType: string;
}

export interface MockGenResult {
  /** Path relative to the meta output root → file content. Holds the handler module alone. */
  files: Map<string, string>;
  /**
   * `src/mock/index.ts`: the stores, their reset and the handler spreads. Rewritten on every run
   * unless the file on disk holds a handler override — see {@link canRegenerateMockEntry}.
   */
  entry: string;
  /**
   * `src/mock/seeds.ts`: one typed array per store entity. Written only when the file does not
   * exist, so a domain keeps whatever data was put there by hand.
   */
  seeds: string;
  unresolvedStoreTypes: UnresolvedStoreType[];
  unresolvedOrderFields: UnresolvedOrderField[];
  unmatchableParameters: UnmatchableParameter[];
  /**
   * DTO name → the fields the model declares as a labeled enum, so a preserved array whose rows
   * hold bare values can be taken into that shape.
   *
   * Keyed by the type rather than by the store that carries it: a preserved module holds arrays
   * for entities the meta path does not back, and those rows are annotated with a DTO all the
   * same. Read from the model rather than from the emitted text, since a generated row omits an
   * optional field the preserved one may still hold.
   */
  labeledSeedFields: Map<string, string[]>;
}

/**
 * Emit the MSW handlers of a domain, the entry that wires them to stores, and the seed rows those
 * stores start from.
 *
 * Every operation of the domain gets a handler, whatever its role: a route MSW does not answer is
 * passed through to a server that is not running, and a custom action — a quarter of this
 * application's operations — has no CRUD role at all. What an operation cannot answer from the
 * store it answers with an empty body.
 *
 * Nothing here reads the filesystem. Which DTO a store carries, which field identifies a record
 * and whether that field is a number are all read from the IR, so a domain whose `src/generated/`
 * has never been written generates exactly what a migrated one does.
 */
export function generateMockFiles(domain: ResolvedDomain, options: MockGenOptions): MockGenResult {
  const model = new ModelIndex(domain, options.labeledEnum);
  const entities = resolveEndpoints(domain, options.naming).map(
    (resolved) => new MockEntity(resolved.tag, resolved.targets, domain, model),
  );
  const emitter = new MockEmitter(domain, entities, model, options);

  // The handlers are written first: emitting them is what finds a parameter nothing can be
  // matched against and a reorder body that names no field.
  const handlers = emitter.handlersFile();

  return {
    files: new Map([[`${MOCK_DIR}/handlers.ts`, handlers]]),
    entry: emitter.entryFile(),
    seeds: emitter.seedFile(),
    unresolvedStoreTypes: entities
      .filter((entity) => entity.storeType === undefined && entity.storeRoles.length > 0)
      .map((entity) => ({ tag: entity.tag, roles: [...new Set(entity.storeRoles)] })),
    unresolvedOrderFields: emitter.unresolvedOrderFields,
    unmatchableParameters: emitter.unmatchableParameters,
    labeledSeedFields: new Map(
      [...domain.types.values()]
        .map(
          (type) =>
            [
              type.name,
              type.allFields
                .filter((field) => model.labeledAt(type, field))
                .map((field) => field.name),
            ] as const,
        )
        .filter(([, fields]) => fields.length > 0),
    ),
  };
}

// ── Reading the IR ───────────────────────────────────────────

/**
 * What the model generator decided about the domain's declarations, asked here so a seed row
 * carries the same shape the type it is annotated with declares.
 */
class ModelIndex {
  /** The types a response of the domain reaches, which is where a labeled enum is an object. */
  private readonly responseTypes: ReadonlySet<string>;

  constructor(
    private readonly domain: ResolvedDomain,
    /**
     * Absent when the profile states no wrapper, which is when the model declares every enum as
     * its bare value union. A row annotated with that type must carry the value, so the two halves
     * take the same gate rather than one reading `labeled` and the other the profile.
     */
    private readonly labeledEnum: LabeledEnumMapping | undefined,
  ) {
    this.responseTypes = reachableFrom(domain, responseRefs(domain));
  }

  /**
   * Whether a field of `carrier` holds its enum as `{ value, label }` rather than as the bare
   * value. The model generator makes that choice per declaring type, so an inherited field is
   * asked about the ancestor that declares it rather than about the type that carries it.
   */
  labeledAt(carrier: ResolvedType, field: FieldMeta): boolean {
    if (field.type.kind !== "enum") return false;
    if (this.labeledEnum === undefined) return false;
    if (this.domain.enums.get(field.type.name)?.meta.labeled !== true) return false;
    return this.responseTypes.has(this.declaringType(carrier, field.name));
  }

  private declaringType(carrier: ResolvedType, field: string): string {
    for (const name of [carrier.name, ...carrier.ancestors]) {
      if (this.domain.types.get(name)?.meta.fields.some((one) => one.name === field)) return name;
    }
    return carrier.name;
  }
}

/** One tag's worth of operations, with everything its handlers are written from resolved once. */
class MockEntity {
  readonly name: string;
  readonly pascal: string;
  /** Parameterless routes first: MSW matches in registration order and the first match answers. */
  readonly targets: EndpointTarget[];
  readonly storeType: ResolvedType | undefined;
  readonly storeRoles: string[];
  /** The field a record is identified by, as the IR's own path parameters name it. */
  readonly idField: string;
  /** Whether that field arrives as a number, which decides `Number(…)` against `String(…)`. */
  readonly idNumeric: boolean;

  constructor(
    readonly tag: string,
    targets: EndpointTarget[],
    private readonly domain: ResolvedDomain,
    readonly model: ModelIndex,
  ) {
    this.name = entityNameOf(tag);
    this.pascal = this.name.charAt(0).toUpperCase() + this.name.slice(1);
    this.targets = sortByRouteShape(targets);
    this.storeRoles = targets.filter((one) => CRUD_STORE_ROLES.has(one.role)).map((one) => one.role);
    this.storeType = this.deriveStoreType();

    const identity = this.deriveIdentity();
    this.idField = identity.field;
    this.idNumeric = identity.numeric;
  }

  /** Whether a store is worth wiring: something has to read it, and it has to have a type. */
  get backed(): boolean {
    return this.storeType !== undefined && this.storeRoles.length > 0;
  }

  /** The name the store's DTO is written under, only ever asked when the entity is backed. */
  get storeTypeName(): string {
    return this.storeType?.name ?? "";
  }

  /** Whether the DTO declares {@link idField} as something a store key can be read out of. */
  get hasDeclaredIdField(): boolean {
    const declared = this.fieldNamed(this.idField);
    return declared !== undefined && (declared.type.kind === "string" || declared.type.kind === "number");
  }

  fieldNamed(name: string): FieldMeta | undefined {
    return this.storeType?.allFields.find((field) => field.name === name);
  }

  declares(name: string): boolean {
    return this.fieldNamed(name) !== undefined;
  }

  /** The field a tree's rows point at their parent through. */
  get parentField(): string {
    const fields = this.storeType?.allFields ?? [];
    const exact = fields.find((field) => field.name === "parentId");
    if (exact) return exact.name;
    return fields.find((field) => /^parent.*id$/i.test(field.name))?.name ?? "parentId";
  }

  /**
   * The DTO a store carries.
   *
   * An entity owns several DTOs and the store is typed with one of them: the record a detail
   * screen reads. That is the payload of a GET that returns one object rather than a page of
   * them, preferring the route whose last segment is the identifier — an entity whose edit form
   * is declared before its detail would otherwise be stored as the form.
   *
   * The response is the signal rather than the role, because an owned singleton — a policy at
   * `/safety-zone/{id}/policy` — has no `get` role at all and still returns the type the screens
   * read.
   */
  private deriveStoreType(): ResolvedType | undefined {
    const singleGets = this.targets.filter(
      (one) =>
        one.operation.method === "GET" &&
        refNameOf(payloadOf(one.operation.response, this.domain)) !== undefined,
    );
    const identified = singleGets.find((one) => /\{\w+\}$/.test(one.operation.path));
    const chosen = identified ?? singleGets[0];
    if (chosen) return this.typeNamed(refNameOf(payloadOf(chosen.operation.response, this.domain)));

    // Nothing returns one record, so the element of whatever a list returns is the next best
    // reading of what this entity holds, and a request body the last.
    const gets = this.targets.filter((one) => one.operation.method === "GET");
    return (
      this.firstInnermost(gets.map((one) => one.operation.response)) ??
      this.firstInnermost(this.targets.map((one) => one.operation.response)) ??
      this.firstInnermost(this.targets.map((one) => one.operation.request.body))
    );
  }

  private firstInnermost(refs: (TypeRef | undefined)[]): ResolvedType | undefined {
    for (const ref of refs) {
      const found = this.typeNamed(refNameOf(innermostRef(ref)));
      if (found) return found;
    }
    return undefined;
  }

  private typeNamed(name: string | undefined): ResolvedType | undefined {
    return name === undefined ? undefined : this.domain.types.get(name);
  }

  /**
   * The identifier, taken from the route that has to name one: a delete addresses exactly one
   * record, and so does a read of one. Both state the parameter's type as well, which is what
   * decides whether the handler reads `Number(params.x)` or `String(params.x)` — and reading a
   * string identifier as a number produces `NaN`, whose lookup misses and falls through to the
   * first row of the store for every request.
   */
  private deriveIdentity(): { field: string; numeric: boolean } {
    for (const role of ["delete", "get", "update", "getForEdit", "subtree"]) {
      const param = this.targets.find((one) => one.role === role)?.operation.request.path.at(-1);
      if (param) return { field: param.name, numeric: isNumericParam(param) };
    }

    // No route addresses a single record. A census or a singleton is read and written whole, and
    // the DTO's own key — when it declares one — is all that is left to store rows under.
    const fields = this.storeType?.allFields ?? [];
    const declared =
      fields.find((field) => field.name.toLowerCase() === "id") ??
      fields.find((field) => /[A-Za-z]Id$/.test(field.name));
    if (declared) {
      return { field: declared.name, numeric: declared.type.kind === "number" };
    }
    return { field: "id", numeric: false };
  }
}

/**
 * Parameterless routes first, so `/org/tree` is registered before `/org/{orgId}` and answers its
 * own request. MSW matches in registration order and the first match wins, so a detail route
 * registered first swallows every sibling of the collection it belongs to.
 *
 * The test is what the IR states about the operation rather than anything spelled in the path: a
 * sort keyed on the `:` of an MSW pattern reads every `{param}` path as parameterless, compares
 * them all equal, and leaves the document's own order in place.
 */
function sortByRouteShape(targets: EndpointTarget[]): EndpointTarget[] {
  return [...targets].sort((left, right) => {
    const leftParams = left.operation.request.path.length > 0;
    const rightParams = right.operation.request.path.length > 0;
    if (leftParams === rightParams) return 0;
    return leftParams ? 1 : -1;
  });
}

/** Whether a response is a collection, which decides between one row and the whole list. */
function isCollection(ref: TypeRef | undefined, domain: ResolvedDomain): boolean {
  const payload = payloadOf(ref, domain);
  // A `Map` is a keyed object rather than a sequence, and nothing indexes it by a row.
  return payload?.kind === "container" && payload.name !== "Map";
}

function isNumericParam(param: ParamMeta): boolean {
  return param.type.kind === "number";
}

// ── Emitting ─────────────────────────────────────────────────

class MockEmitter {
  readonly unresolvedOrderFields: UnresolvedOrderField[] = [];
  readonly unmatchableParameters: UnmatchableParameter[] = [];
  private readonly metaRoot: string;

  constructor(
    private readonly domain: ResolvedDomain,
    private readonly entities: MockEntity[],
    private readonly model: ModelIndex,
    private readonly options: MockGenOptions,
  ) {
    this.metaRoot = options.metaRoot ?? DEFAULT_META_ROOT;
  }

  /** The whole domain's handlers: one factory per entity, in one module. */
  handlersFile(): string {
    const bodies = this.entities.map((entity) => this.factory(entity));
    const backed = this.entities.filter((entity) => entity.backed);
    const imports = ["import { http, HttpResponse } from 'msw';"];

    if (this.options.envelope) {
      imports.push(
        `import { ${this.options.envelope.wrap} } from '${this.options.envelope.import}';`,
      );
    }
    if (backed.length > 0) {
      imports.push("import type { MockEntityStore } from '@simplix-react/mock';");
      if (this.entities.some((one) => one.targets.some((target) => target.role === "tree"))) {
        imports.push("import { buildEmbeddedTree } from '@simplix-react/mock';");
      }
      // Two entities can carry the same DTO — a record read by its owner and by an administrator
      // is one record — and naming it twice in one import is a duplicate declaration.
      const names = [...new Set(backed.map((one) => one.storeTypeName))].sort();
      imports.push(`import type { ${names.join(", ")} } from '${MODEL_DIR}';`);
    }

    return [HEADER, "", ...imports, "", ...bodies].join("\n");
  }

  /** One entity's factory. An entity with no store answers every route with an empty body. */
  private factory(entity: MockEntity): string {
    const parameter = entity.backed
      ? `store: MockEntityStore<${entity.storeTypeName}>`
      : "";
    const answers = entity.backed
      ? "answering from the store the entry wires in"
      : "answering with an empty body: no response of the entity names a DTO to hold";
    const entries = entity.targets.map((target) => this.handler(entity, target));

    return `/** Handlers for \`${entity.tag}\`, ${answers}. */
export function create${entity.pascal}Handlers(${parameter}) {
  return [
${entries.join("\n")}
  ];
}
`;
  }

  /** One operation's handler. Every operation gets one, whatever the role resolved to. */
  private handler(entity: MockEntity, target: EndpointTarget): string {
    const method = target.operation.method.toLowerCase();
    const pattern = mswPattern(target.operation.path);
    const open = `    http.${method}(${JSON.stringify(pattern)}, `;

    if (!entity.backed) return `${open}() => ${this.json("{}")}),`;

    switch (target.role) {
      case "list":
      case "search":
        return this.listHandler(entity, target, open);
      case "getAll":
        return `${open}() => ${this.json("store.list()")}),`;
      case "get":
      case "getForEdit":
      case "subtree":
        return this.readHandler(entity, target, open);
      case "create":
        return `${open}async ({ request }) => ${this.json(
          `store.create(await request.json() as ${entity.storeTypeName})`,
        )}),`;
      case "update":
      case "multiUpdate":
      case "batchUpdate":
        return this.updateHandler(entity, target, open);
      case "delete":
        return this.deleteHandler(entity, target, open);
      case "batchDelete":
        return `${open}() => ${this.json("{}")}),`;
      case "order":
        return this.orderHandler(entity, target, open);
      case "tree":
        return this.treeHandler(entity, open);
      default:
        // A custom action — an escalation, a revocation, a dismissal — which is what a quarter of
        // this application's operations are. A read addressed by a path parameter is a
        // sub-resource of the entity and is answered from its store; anything else has nothing in
        // the store to answer with, and a route left unhandled is passed through to a server that
        // is not there.
        return target.operation.method === "GET" && target.operation.request.path.length > 0
          ? this.readHandler(entity, target, open)
          : `${open}() => ${this.json("{}")}),`;
    }
  }

  /**
   * A list, answered as a page.
   *
   * `listPaged` returns the page shape whole; nothing here assembles one, because a hand-built
   * page and the store's own disagree about the count the moment a row is added.
   */
  private listHandler(entity: MockEntity, target: EndpointTarget, open: string): string {
    const filter = this.filterKey(entity, target);
    const lines = [`${open}({ request }) => {`, "      const url = new URL(request.url);"];

    if (filter) {
      const variable = filter.key.replace(/[^A-Za-z0-9_$]/g, "_");
      lines.push(
        `      const ${variable} = url.searchParams.get(${JSON.stringify(filter.key)});`,
        `      if (${variable}) return ${this.json(
          `store.filter((item) => item.${filter.field} === ${variable})`,
        )};`,
      );
    }

    lines.push(
      '      const page = Number(url.searchParams.get("page") ?? "0");',
      '      const size = Number(url.searchParams.get("size") ?? "10");',
      '      const sort = url.searchParams.get("sort") ?? undefined;',
      `      return ${this.json("store.listPaged(page, size, sort)")};`,
      "    }),",
    );
    return lines.join("\n");
  }

  /**
   * The query key a list narrows itself by, and the field it reads.
   *
   * A searchable route states no parameter of its own — its filters are the ones its search DTO
   * declares — so the key is built the way the client builds it, `field.operator`. Either way the
   * field has to be one the store's DTO declares, or the emitted predicate reads a property that
   * is not there.
   */
  private filterKey(
    entity: MockEntity,
    target: EndpointTarget,
  ): { key: string; field: string } | undefined {
    const searchDto = target.operation.request.searchDto;
    if (searchDto) {
      const declared = this.domain.types.get(searchDto);
      if (declared) {
        const { fields } = readSearchFields(declared.allFields, (name) =>
          this.domain.enums.get(name)?.meta.values.map((value) => value.name),
        );
        const found = fields.find(
          (field: SearchField) =>
            field.kind === "string" &&
            field.operators.includes("EQUALS") &&
            entity.declares(field.name),
        );
        if (found) return { key: `${found.name}.equals`, field: found.name };
      }
    }

    const query = target.operation.request.query.find(
      (param) => param.type.kind === "string" && entity.declares(baseName(param.name)),
    );
    return query ? { key: query.name, field: baseName(query.name) } : undefined;
  }

  /**
   * A read addressed by a path parameter.
   *
   * The parameter is the identifier on a detail route and something else on a sub-resource one —
   * `/emergency-contact/{emergencyContactId}/on-call` reads the cells of a contact — and there
   * the store can only be narrowed when its DTO declares a field of that name. Where it does not,
   * the whole list is the answer: a filter that matches nothing followed by a fallback to the
   * first row shows one arbitrary record for every parent.
   */
  private readHandler(entity: MockEntity, target: EndpointTarget, open: string): string {
    const param = target.operation.request.path.at(-1);
    const many = isCollection(target.operation.response, this.domain);
    if (!param) {
      return `${open}() => ${this.json(many ? "store.list()" : "store.list()[0]")}),`;
    }

    if (param.name === entity.idField && !many) {
      const key = isNumericParam(param) ? `Number(params.${param.name})` : `String(params.${param.name})`;
      return `${open}({ params }) => ${this.json(`store.getById(${key}) ?? store.list()[0]`)}),`;
    }

    if (!entity.declares(param.name)) {
      this.unmatchableParameters.push({
        tag: entity.tag,
        operation: target.operation.id,
        parameter: param.name,
        storeType: entity.storeTypeName,
      });
      return `${open}() => ${this.json(many ? "store.list()" : "store.list()[0]")}),`;
    }

    const matches = `store.filter((item) => String(item.${param.name}) === String(params.${param.name}))`;
    return `${open}({ params }) => ${this.json(
      many ? matches : `${matches}[0] ?? store.list()[0]`,
    )}),`;
  }

  /** A write, addressed by a path parameter where there is one and by the body where there is not. */
  private updateHandler(entity: MockEntity, target: EndpointTarget, open: string): string {
    const type = entity.storeTypeName;
    const param = target.operation.request.path.at(-1);
    if (param) {
      const key = isNumericParam(param) ? `Number(params.${param.name})` : `String(params.${param.name})`;
      return `${open}async ({ request, params }) => ${this.json(
        `store.update(${key}, await request.json() as ${type})`,
      )}),`;
    }

    // A multi-update carries the key in the body. A DTO that declares none — a settings document
    // read and written whole — is read through a cast, and the write falls through to a create.
    const declared = entity.hasDeclaredIdField;
    const keyLine = declared
      ? `      const key = body.${entity.idField}!;`
      : `      const key = (body as { ${entity.idField}?: string | number }).${entity.idField};`;
    const write = declared
      ? `store.update(key, body)`
      : `(key === undefined ? undefined : store.update(key, body))`;

    return [
      `${open}async ({ request }) => {`,
      `      const body = await request.json() as ${type};`,
      keyLine,
      `      return ${this.json(`${write} ?? store.create(body)`)};`,
      "    }),",
    ].join("\n");
  }

  private deleteHandler(entity: MockEntity, target: EndpointTarget, open: string): string {
    const param = target.operation.request.path.at(-1);
    if (!param) return `${open}() => ${this.json("{}")}),`;
    const key = isNumericParam(param) ? `Number(params.${param.name})` : `String(params.${param.name})`;
    return `${open}({ params }) => { store.remove(${key}); return ${this.json("null")}; }),`;
  }

  /**
   * A reorder, writing the field the operation's own body declares.
   *
   * The field is read from the order DTO rather than guessed from the entity's own: a guess that
   * falls back to a literal writes a property the DTO does not have, and the cast that made the
   * guess compile is what hides it.
   */
  private orderHandler(entity: MockEntity, target: EndpointTarget, open: string): string {
    const inner = innermostRef(target.operation.request.body);
    const dto = this.domain.types.get(refNameOf(inner) ?? "");
    const key = dto?.allFields.find((field) => isIdName(field.name));
    const field = dto?.allFields.find((one) => !isIdName(one.name));

    if (!dto || !key || !field) {
      this.unresolvedOrderFields.push({ tag: entity.tag, operation: target.operation.id });
      return `${open}() => ${this.json("{}")}),`;
    }

    const keyType = key.type.kind === "number" ? "number" : "string";
    const valueType = field.type.kind === "number" ? "number" : "string";
    // The order field belongs to the reorder DTO; a store whose own DTO does not declare it takes
    // the write through a cast, which is the one place the cast says something true.
    const write = entity.declares(field.name)
      ? `{ ${field.name}: item.${field.name} }`
      : `{ ${field.name}: item.${field.name} } as never`;

    return [
      `${open}async ({ request }) => {`,
      `      const items = await request.json() as { ${key.name}: ${keyType}; ${field.name}: ${valueType} }[];`,
      `      for (const item of items) store.update(item.${key.name}, ${write});`,
      `      return ${this.json("{}")};`,
      "    }),",
    ].join("\n");
  }

  private treeHandler(entity: MockEntity, open: string): string {
    const args = [
      "store.list()",
      JSON.stringify(entity.idField),
      JSON.stringify(entity.parentField),
    ];
    return `${open}() => ${this.json(`buildEmbeddedTree(${args.join(", ")})`)}),`;
  }

  /** A response, wrapped in whatever the backend wraps its bodies in. */
  private json(body: string): string {
    const wrap = this.options.envelope?.wrap;
    return `HttpResponse.json(${wrap ? `${wrap}(${body})` : body})`;
  }

  /** `src/mock/index.ts`: the stores, their reset, and the generated handler spreads. */
  entryFile(): string {
    const backed = this.entities.filter((entity) => entity.backed);
    const imports = ["import type { MockDomainConfig } from '@simplix-react/mock';"];

    if (backed.length > 0) {
      imports.push("import { createMockEntityStore } from '@simplix-react/mock';");
      const types = [...new Set(backed.map((one) => one.storeTypeName))].sort();
      imports.push(`import type { ${types.join(", ")} } from '${this.metaRoot}/model';`);
      imports.push(
        `import { ${backed.map((one) => `${one.name}Seeds`).join(", ")} } from './seeds';`,
      );
    }
    if (this.entities.length > 0) {
      const factories = this.entities.map((one) => `create${one.pascal}Handlers`);
      imports.push(
        `import { ${factories.join(", ")} } from '${this.metaRoot}/${MOCK_DIR}/handlers';`,
      );
    }

    const stores = backed.map((entity) => {
      const key = entity.idField === "id" ? "" : `, ${JSON.stringify(entity.idField)}`;
      return `const ${entity.name}Store = createMockEntityStore<${entity.storeTypeName}>(${entity.name}Seeds${key});`;
    });
    const resets = backed.map((entity) => `  ${entity.name}Store.reset();`);
    const spreads = this.entities.map(
      (entity) =>
        `      ...create${entity.pascal}Handlers(${entity.backed ? `${entity.name}Store` : ""}),`,
    );

    const lines = [HEADER, "", ...imports, ""];
    if (stores.length > 0) lines.push(...stores, "");
    lines.push(`export function create${toPascalCase(this.domain.name)}Mock(): MockDomainConfig {`);
    if (resets.length > 0) lines.push(...resets, "");
    lines.push(
      "  return {",
      `    name: ${JSON.stringify(this.domain.name)},`,
      "    handlers: [",
      `      ${MOCK_OVERRIDE_MARKER}`,
      "",
      `      ${MOCK_GENERATED_MARKER}`,
      ...spreads,
      "    ],",
      "  };",
      "}",
      "",
    );
    return lines.join("\n");
  }

  /** `src/mock/seeds.ts`: one typed array per store entity. */
  seedFile(): string {
    const backed = this.entities.filter((entity) => entity.backed);
    if (backed.length === 0) return "";

    const types = [...new Set(backed.map((one) => one.storeTypeName))].sort();
    const lines = [
      "/**",
      " * Mock seed data, generated from the DTO meta IR.",
      " *",
      " * Written once and never overwritten: the rows here are the domain's to replace with data",
      " * that reads like the real thing.",
      " */",
      `import type { ${types.join(", ")} } from '${this.metaRoot}/model';`,
      "",
    ];

    for (const entity of backed) {
      const rows: string[] = [];
      for (let index = 1; index <= SEED_COUNT; index += 1) {
        rows.push(this.seedRow(entity, index));
      }
      lines.push(
        `export const ${entity.name}Seeds: ${entity.storeTypeName}[] = [`,
        rows.join(",\n") + ",",
        "];",
        "",
      );
    }
    return lines.join("\n");
  }

  private seedRow(entity: MockEntity, index: number): string {
    const type = entity.storeType;
    if (!type) return "  {}";
    const members: string[] = [];
    for (const field of type.allFields) {
      const value = this.seedValue(field, type, index, entity.name, new Set([type.name]));
      if (value !== undefined) members.push(`    ${field.name}: ${value}`);
    }
    return members.length === 0 ? "  {}" : `  {\n${members.join(",\n")},\n  }`;
  }

  /**
   * One field's seed value, or nothing when the field is optional and carries a shape a literal
   * cannot honestly stand in for.
   *
   * The row is annotated with the DTO's own type, so every value here is held against the model
   * generator's reading of the same field: a labeled enum is the `{ value, label }` object that
   * generator declares, a `Map` is left out rather than written as the `[]` a `List` takes, and a
   * clock time is the `HH:mm` text a time control parses.
   */
  private seedValue(
    field: FieldMeta,
    carrier: ResolvedType,
    index: number,
    entityName: string,
    open: Set<string>,
  ): string | undefined {
    const ref = field.type;
    switch (ref.kind) {
      case "string":
        return quoted(this.stringSeed(field, index, entityName));
      case "number":
        return numberSeed(field, index, ref.integral);
      case "boolean":
        return index % 2 === 0 ? "true" : "false";
      case "instant":
        return quoted(seedDate(index).toISOString());
      case "date":
        return quoted(seedDate(index).toISOString().slice(0, 10));
      case "time":
        // A `LocalTime` arrives as its clock text; the generic `<entity>-<field>-<n>` a fallback
        // would produce is not a time, and the control that reads it parses nothing.
        return quoted(`${String(6 + (index % 12)).padStart(2, "0")}:00`);
      case "enum":
        return this.enumSeed(ref.name, carrier, field, index);
      case "container":
        if (ref.name === "Map") return field.required ? "{}" : undefined;
        return "[]";
      case "ref":
        return field.required ? this.nestedSeed(ref.name, index, entityName, open) : undefined;
      case "pick":
        return field.required ? "{}" : undefined;
      case "file":
      case "binary":
        return field.required ? "new Blob([])" : undefined;
      default:
        // `unknown` and an unbound type variable both accept anything the row can carry.
        return field.required ? "null" : undefined;
    }
  }

  private enumSeed(
    name: string,
    carrier: ResolvedType,
    field: FieldMeta,
    index: number,
  ): string | undefined {
    const values = this.domain.enums.get(name)?.meta.values ?? [];
    if (values.length === 0) return field.required ? "null" : undefined;
    const value = values[(index - 1) % values.length].name;
    // A labeled enum is an object on a response, so a bare string in a row annotated with the
    // DTO's own type is a value of the wrong shape rather than a different-looking one.
    return this.model.labeledAt(carrier, field)
      ? `{ value: ${JSON.stringify(value)}, label: ${JSON.stringify(value)} }`
      : JSON.stringify(value);
  }

  /** A required nested DTO, carrying its own required fields and nothing more. */
  private nestedSeed(
    name: string,
    index: number,
    entityName: string,
    open: Set<string>,
  ): string {
    const type = this.domain.types.get(name);
    // A type that reaches itself through a required field cannot be satisfied by any literal.
    if (!type || open.has(name)) return "{}";
    const nested = new Set([...open, name]);
    const members = type.allFields
      .filter((field) => field.required)
      .map((field) => {
        const value = this.seedValue(field, type, index, entityName, nested);
        return value === undefined ? undefined : `${field.name}: ${value}`;
      })
      .filter((member): member is string => member !== undefined);
    return `{ ${members.join(", ")} }`;
  }

  private stringSeed(field: FieldMeta, index: number, entityName: string): string {
    const name = field.name.toLowerCase();
    // The backend states the format as a constraint, which is what a name can only be read as a
    // hint of. It states it on what it validates — the DTOs a request carries — and a store is
    // typed with the DTO a response carries, so the name is still the only reading left there.
    if (field.constraints?.some((one) => one.kind === "email") || name.includes("email")) {
      return `user${index}@example.com`;
    }
    if (isIdName(field.name)) return String(index);
    if (name === "name" || name === "title") {
      return `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} ${index}`;
    }
    if (name.includes("password")) return `password${index}`;
    if (name.includes("username")) return `user${index}`;
    if (name.includes("phone")) return `555-010${index}`;
    if (name.includes("address")) return `${index * 100} Main Street`;
    if (name.includes("description") || name.includes("summary")) {
      return `Sample ${entityName} description ${index}`;
    }
    if (name.includes("url") || name.includes("image") || name.includes("photo")) {
      return `https://example.com/images/${entityName}${index}.jpg`;
    }
    return `${field.name}-${index}`;
  }
}

/** The pattern MSW matches a route by: any origin, and its parameters in MSW's own spelling. */
export function mswPattern(path: string): string {
  // The IR spells a path parameter `{name}`, which MSW reads as a literal segment: a pattern
  // holding one matches no request at all, and every call falls through to a server that is not
  // running.
  return `*${path.replace(/\{(\w+)\}/g, ":$1")}`;
}

/** A key's base, which is what a dotted filter parameter names before its operator. */
function baseName(name: string): string {
  const at = name.indexOf(".");
  return at === -1 ? name : name.slice(0, at);
}

function isIdName(name: string): boolean {
  return name.toLowerCase() === "id" || name.toLowerCase().endsWith("id");
}

function numberSeed(field: FieldMeta, index: number, integral: boolean): string {
  const name = field.name.toLowerCase();
  if (isIdName(field.name)) return String(index);
  if (!integral) return ((index * 19.99) % 100).toFixed(2);
  if (name.includes("quantity") || name.includes("count")) return String(index * 2);
  return String(index * 10);
}

function seedDate(index: number): Date {
  return new Date(Date.UTC(2026, 0, 1 + index * 5));
}

function quoted(text: string): string {
  return JSON.stringify(text);
}
