import type { OpenApiNamingStrategy } from "../../openapi/naming/naming-strategy.js";
import type { OperationMeta, ParamMeta, TypeRef } from "../ir-types.js";
import type { ResolvedDomain } from "../resolve.js";
import {
  containerTypeExpression,
  ENUM_MODULE,
  entityModuleBase,
  HEADER,
  memberName,
  PRIMITIVES,
} from "./emit.js";
import { modelFileBase } from "./model-gen.js";

/** Directory the endpoint modules land in, relative to a generated package's meta output. */
export const ENDPOINT_DIR = "endpoints";

/** Where the model declarations live, seen from a module of {@link ENDPOINT_DIR}. */
const MODEL_DIR = "../model";

/**
 * The domain package's mutator, seen from a module of {@link ENDPOINT_DIR}. Every request goes
 * through it rather than through `getMutator`, so a package configured against another backend
 * changes one file instead of every endpoint.
 */
export const MUTATOR_MODULE = "../../mutator";

/** Module holding the helpers a URL builder and a multipart body are written against. */
const REQUEST_MODULE = "_request";

export interface EndpointGenOptions {
  /**
   * Contributed by the spec profile: what an operation's request function, hook and CRUD role are
   * called. The names are not cosmetic — module code imports hooks by name and `crud.config.ts`
   * drives the scaffolder off the same ones.
   */
  naming: OpenApiNamingStrategy;
}

/** A name a domain exports from two of its entity modules, which its barrel cannot carry. */
export interface DuplicateExport {
  name: string;
  /** The operation ids that produced it, in the order the entities were written. */
  operations: string[];
}

export interface EndpointGenResult {
  /** Path relative to the meta output root → file content. */
  files: Map<string, string>;
  duplicateExports: DuplicateExport[];
  /**
   * Operations whose file parts the IR carries as query parameters. They are sent as a form body
   * instead, because a `Blob` in a query string is the file's `[object Blob]` spelling.
   */
  multipartOperations: string[];
}

/**
 * One operation, resolved into the names and the shapes both generated halves are written from.
 *
 * The hooks are generated from the same resolution rather than from a second walk of the IR: a
 * hook that disagrees with its request function about a parameter's position compiles and sends
 * the wrong argument.
 */
export interface EndpointTarget {
  operation: OperationMeta;
  /** The entity its tag names, which is the name the strategy resolves the operation against. */
  entity: string;
  /** The CRUD role, which is the key `crud.config.ts` stores the hook name under. */
  role: string;
  /** The request function's name, and the hook's name without its `use` prefix. */
  name: string;
  /** {@link name} with its initial raised, which every emitted type name is built from. */
  pascal: string;
  /** A GET is read through `useQuery`; every other method is a mutation. */
  isQuery: boolean;
  pathParams: ParamMeta[];
  /** The query parameters the IR states, which a searchable route leaves to its search DTO. */
  queryParams: ParamMeta[];
  /** Name of the params type, absent when the operation takes no query parameters at all. */
  paramsType?: string;
  /**
   * Whether this generator declares that type. A searchable route's parameters are the filters
   * its DTO defines rather than anything the IR states about the route, so the search generator
   * declares them in the model directory and both halves import the name from there.
   */
  paramsDeclared: boolean;
  /** Whether the params argument may be left out, which it may when every member is optional. */
  paramsOptional: boolean;
  /** Whether the parameters are sent as a form body rather than in the query string. */
  multipart: boolean;
  /** The request body: what the argument is called, and the type it carries. */
  body?: { argument: string; ref: TypeRef };
  /** Name of the emitted response type alias. */
  responseType: string;
}

/** One entity's operations, and the module both halves of it are written into. */
export interface EndpointEntity {
  tag: string;
  entity: string;
  /** The module base, without its extension, shared by this entity's endpoints and hooks. */
  file: string;
  targets: EndpointTarget[];
}

/**
 * Resolve every operation of a domain into the names and shapes the endpoint and hook generators
 * write, grouped by the tag that owns them.
 *
 * The entity name is the tag's last dot-segment with its initial lowered, which is what the
 * profile's `resolveEntityName` answers from the tag alone. Nothing else the IR carries takes
 * part in it, so a tag is the whole of an entity's identity here.
 */
export function resolveEndpoints(
  domain: ResolvedDomain,
  naming: OpenApiNamingStrategy,
): EndpointEntity[] {
  const entities: EndpointEntity[] = [];
  const owners = new Map<string, string>();

  for (const resolved of domain.entities) {
    const entity = entityNameOf(resolved.tag);
    const file = entityModuleBase(resolved.tag);
    const held = owners.get(file);
    if (held !== undefined) {
      throw new Error(
        `Tags '${held}' and '${resolved.tag}' both name the endpoint module '${file}'. One would ` +
          "overwrite the other, and every hook of the entity written first would be missing.",
      );
    }
    owners.set(file, resolved.tag);

    entities.push({
      tag: resolved.tag,
      entity,
      file,
      targets: resolved.operations.map((operation) => target(domain, operation, entity, naming)),
    });
  }

  return entities;
}

/**
 * The entity a tag names: its last dot-segment, with the initial lowered. `site.AreaZone` is
 * `areaZone`.
 */
export function entityNameOf(tag: string): string {
  const last = tag.slice(tag.lastIndexOf(".") + 1);
  return last.charAt(0).toLowerCase() + last.slice(1);
}

/**
 * Emit one module per entity of a domain closure holding its URL builders, query keys and request
 * functions, the helpers those are written against, and the barrel over them.
 *
 * A request goes out through the package's own `customFetch`, whose response is the envelope's
 * body: the mutator strips the wrapper, so the type a function resolves to is what the container
 * held rather than the container.
 */
export function generateEndpointFiles(
  domain: ResolvedDomain,
  options: EndpointGenOptions,
): EndpointGenResult {
  const entities = resolveEndpoints(domain, options.naming);
  const emitter = new EndpointEmitter(domain);

  const files = new Map<string, string>();
  for (const entity of entities) {
    files.set(`${ENDPOINT_DIR}/${entity.file}.ts`, emitter.entityFile(entity));
  }
  if (entities.some((entity) => entity.targets.some((one) => one.paramsType !== undefined))) {
    files.set(`${ENDPOINT_DIR}/${REQUEST_MODULE}.ts`, requestHelpers());
  }
  files.set(`${ENDPOINT_DIR}/index.ts`, barrel(entities));

  return {
    files,
    duplicateExports: collectDuplicateExports(entities),
    multipartOperations: entities
      .flatMap((entity) => entity.targets)
      .filter((one) => one.multipart)
      .map((one) => one.operation.id),
  };
}

/** The barrel over the directory, which every module of it is reachable through. */
function barrel(entities: EndpointEntity[]): string {
  const modules = entities.map((entity) => entity.file).sort();
  return [HEADER, "", ...modules.map((name) => `export * from './${name}';`), ""].join("\n");
}

/**
 * The helpers the emitted URL builders are written against.
 *
 * A list route reads an array parameter as one occurrence per member — `sort=a&sort=b` — which
 * is how the backend's own binder reads it; joining them into one occurrence sorts by a field
 * named after both.
 */
function requestHelpers(): string {
  return `${HEADER}

/** The query string of a request, with an array parameter written once per member. */
export function toQueryString(params: Record<string, unknown> | undefined): string {
  const search = new URLSearchParams();
  for (const [name, value] of Object.entries(params ?? {})) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const member of value) search.append(name, String(member));
      continue;
    }
    search.append(name, String(value));
  }
  return search.toString();
}

/** The form body of a multipart request, which carries the parts a query string cannot. */
export function toFormData(params: Record<string, unknown> | undefined): FormData {
  const form = new FormData();
  for (const [name, value] of Object.entries(params ?? {})) {
    if (value === undefined) continue;
    if (value instanceof Blob) {
      form.append(name, value);
      continue;
    }
    form.append(name, String(value));
  }
  return form;
}
`;
}

/** One operation, with the naming strategy asked what everything generated from it is called. */
function target(
  domain: ResolvedDomain,
  operation: OperationMeta,
  entity: string,
  naming: OpenApiNamingStrategy,
): EndpointTarget {
  const queryParams = operation.request.query;
  const resolved = naming.resolveOperation({
    operationId: operation.id,
    method: operation.method,
    // The IR already spells a path parameter `{name}`, which is the form the strategy reads.
    path: operation.path,
    tag: operation.tag,
    entityName: entity,
    summary: operation.summary,
    // The IR carries no description, and no `x-` extensions; the OpenAPI path passes `{}` too.
    description: undefined,
    responseType: innermostRef(operation.response),
    requestType: innermostRef(operation.request.body),
    pathParams: operation.request.path.map((param) => param.name),
    queryParams: queryParams.map((param) => param.name),
    extensions: {},
  });

  const pascal = resolved.hookName.charAt(0).toUpperCase() + resolved.hookName.slice(1);
  const body = operation.request.body;
  // A searchable route's parameters are the filters its DTO defines, which the search generator
  // writes into the model directory beside the DTOs; this one declares only what the IR states.
  const searchable = operation.request.searchDto !== undefined;
  return {
    operation,
    entity,
    role: resolved.role,
    name: resolved.hookName,
    pascal,
    isQuery: operation.method === "GET",
    pathParams: operation.request.path,
    queryParams,
    paramsType: searchable || queryParams.length > 0 ? `${pascal}Params` : undefined,
    paramsDeclared: !searchable,
    paramsOptional: queryParams.every((param) => !param.required),
    multipart: operation.request.contentType === "multipart",
    body: body ? { argument: bodyArgument(body), ref: body } : undefined,
    responseType: `${pascal}Response`,
  };
}

/** The argument a body is passed as, named after the type it carries. */
function bodyArgument(ref: TypeRef): string {
  const name = innermostRef(ref);
  return name === undefined ? "body" : name.charAt(0).toLowerCase() + name.slice(1);
}

/** The name of the type a reference resolves to, inside however many containers hold it. */
function innermostRef(ref: TypeRef | undefined): string | undefined {
  if (!ref) return undefined;
  if (ref.kind === "ref") return ref.name;
  if (ref.kind === "container") {
    for (const arg of ref.args) {
      const found = innermostRef(arg);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

/**
 * Names two entities of one domain both export. A star-exported name declared twice is dropped
 * from the barrel rather than reported, so the package compiles and the hook is simply missing.
 */
function collectDuplicateExports(entities: EndpointEntity[]): DuplicateExport[] {
  const byName = new Map<string, string[]>();
  for (const entity of entities) {
    for (const one of entity.targets) {
      const held = byName.get(one.name);
      if (held) held.push(one.operation.id);
      else byName.set(one.name, [one.operation.id]);
    }
  }
  return [...byName.entries()]
    .filter(([, operations]) => operations.length > 1)
    .map(([name, operations]) => ({ name, operations }));
}

/** The names one module takes from elsewhere, gathered while its declarations are written. */
export interface FileImports {
  /** Model types, each of which lives in a module of its own. */
  models: Set<string>;
  /** Enum names, all of which live in the model directory's enum module. */
  enums: Set<string>;
  /** Module specifier → the names taken from it, contributed by a container mapping. */
  external: Map<string, Set<string>>;
}

export function newImports(): FileImports {
  return { models: new Set(), enums: new Set(), external: new Map() };
}

/** The `import type` lines for the model declarations and containers a module reached. */
export function modelImportLines(imports: FileImports, modelDir: string): string[] {
  const lines: string[] = [];
  for (const [module, names] of [...imports.external.entries()].sort(byModule)) {
    lines.push(`import type { ${[...names].sort().join(", ")} } from '${module}';`);
  }
  if (imports.enums.size > 0) {
    lines.push(
      `import type { ${[...imports.enums].sort().join(", ")} } from '${modelDir}/${ENUM_MODULE}';`,
    );
  }
  for (const name of [...imports.models].sort()) {
    lines.push(`import type { ${name} } from '${modelDir}/${modelFileBase(name)}';`);
  }
  return lines;
}

function byModule(left: [string, unknown], right: [string, unknown]): number {
  return left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0;
}

/**
 * Renders the types an operation carries. A declaration site binds type parameters and chooses a
 * labeled enum's direction; an operation site binds neither, so this is the plain reading of a
 * reference into the type the client sees.
 */
export class TypeWriter {
  constructor(private readonly domain: ResolvedDomain) {}

  /** The type a request function resolves to: what the envelope held, or nothing at all. */
  response(ref: TypeRef | undefined, imports: FileImports): string {
    if (!ref) return "void";
    return this.render(ref, imports, "void");
  }

  /** The type a body or a parameter carries. */
  value(ref: TypeRef, imports: FileImports): string {
    return this.render(ref, imports, "unknown");
  }

  private render(ref: TypeRef, imports: FileImports, empty: string): string {
    switch (ref.kind) {
      case "number":
        return "number";
      case "enum":
        return this.renderEnum(ref.name, imports);
      case "ref":
        return this.renderRef(ref.name, ref.args, imports);
      case "container": {
        const rendered = ref.args.map((arg) => this.render(arg, imports, empty));
        const mapping = this.domain.containers.get(ref.name);
        // An unmapped container is reported by the resolver; it has no client type to name.
        if (!mapping) return "unknown";
        const external = (module: string, name: string): void => {
          const names = imports.external.get(module) ?? new Set<string>();
          names.add(name);
          imports.external.set(module, names);
        };
        return containerTypeExpression(mapping, rendered, external) ?? rendered[0] ?? empty;
      }
      case "pick": {
        const keys = ref.fields.map((name) => `'${name}'`).join(" | ");
        const of = this.renderRef(ref.of, undefined, imports);
        return `Pick<${of}, ${keys === "" ? "never" : keys}>`;
      }
      case "param":
        // A type variable is bound by the declaration that owns it, and an operation owns none.
        return "unknown";
      default:
        return PRIMITIVES[ref.kind];
    }
  }

  private renderEnum(name: string, imports: FileImports): string {
    // A name the IR does not declare is already reported by the resolver; importing it here would
    // point at a module no generator writes. A request carries the value rather than its label,
    // so the union is the shape on this side of the wire.
    if (!this.domain.enums.has(name)) return "unknown";
    imports.enums.add(name);
    return name;
  }

  private renderRef(name: string, args: TypeRef[] | undefined, imports: FileImports): string {
    const target = this.domain.types.get(name);
    if (!target) return "unknown";
    imports.models.add(name);
    if (!args || args.length === 0) return name;
    return `${name}<${args.map((arg) => this.render(arg, imports, "unknown")).join(", ")}>`;
  }
}

class EndpointEmitter {
  private readonly types: TypeWriter;

  constructor(domain: ResolvedDomain) {
    this.types = new TypeWriter(domain);
  }

  /** One entity's module: its params and response types, then a request function per operation. */
  entityFile(entity: EndpointEntity): string {
    const imports = newImports();
    for (const one of entity.targets) {
      if (one.paramsType && !one.paramsDeclared) imports.models.add(one.paramsType);
    }
    const bodies = entity.targets.map((one) => this.operation(one, imports));
    // A searchable route states no query parameter of its own and still sends a query string:
    // what it sends is the search DTO's, and the params type it is handed carries all of it.
    const helpers = new Set<string>();
    for (const one of entity.targets) {
      if (one.paramsType === undefined) continue;
      helpers.add(one.multipart ? "toFormData" : "toQueryString");
    }

    const lines = [HEADER, "", ...modelImportLines(imports, MODEL_DIR)];
    lines.push(`import { customFetch } from '${MUTATOR_MODULE}';`);
    if (helpers.size > 0) {
      lines.push(`import { ${[...helpers].sort().join(", ")} } from './${REQUEST_MODULE}';`);
    }
    lines.push("");
    return [...lines, ...bodies].join("\n");
  }

  /** One operation: its params type, its response type, its URL, its key and its request. */
  private operation(target: EndpointTarget, imports: FileImports): string {
    const parts: string[] = [];
    if (target.paramsType && target.paramsDeclared) parts.push(this.paramsType(target, imports));
    const resolves =
      `The type \`${target.name}\` resolves to, once the mutator has stripped the envelope.`;
    const response = this.types.response(target.operation.response, imports);
    parts.push(`${docLine(resolves)}export type ${target.responseType} = ${response};\n`);
    parts.push(...this.url(target, imports));
    parts.push(this.request(target, imports));
    return parts.join("\n");
  }

  /** The query parameters as one type, whose members carry the requiredness the IR states. */
  private paramsType(target: EndpointTarget, imports: FileImports): string {
    const members = target.queryParams.map((param) => {
      const optional = param.required ? "" : "?";
      const doc = param.description ? `  ${jsDoc(param.description)}\n` : "";
      const type = this.types.value(param.type, imports);
      return `${doc}  ${memberName(param.name)}${optional}: ${type};`;
    });

    const read = `What \`${target.name}\` reads from the query string.`;
    return `${docLine(read)}export type ${target.paramsType} = {
${members.join("\n")}
};
`;
  }

  /**
   * The URL and the query key.
   *
   * The key carries the path without the query string, so everything read from one route shares a
   * prefix and one invalidation reaches all of it; the parameters ride beside it as the object the
   * caller passed.
   */
  private url(target: EndpointTarget, imports: FileImports): string[] {
    const name = target.pascal;
    const pathArgs = this.pathArguments(target, imports).join(", ");
    const pathCall = target.pathParams.map((param) => param.name).join(", ");
    const template = `\`${target.operation.path.replace(/\{(\w+)\}/g, "${$1}")}\``;
    const route = `${target.operation.method} ${target.operation.path}`;
    const key = `The cache key \`use${name}\` reads under.`;
    const emitted: string[] = [];

    // A multipart request carries its parameters in the body, so its URL is the bare path.
    if (target.paramsType === undefined || target.multipart) {
      emitted.push(
        `${docLine(route)}export const get${name}Url = (${pathArgs}): string => ${template};
`,
      );
      if (target.isQuery) {
        emitted.push(
          `${docLine(key)}export const get${name}QueryKey = (${pathArgs}) =>
  [get${name}Url(${pathCall})] as const;
`,
        );
      }
      return emitted;
    }

    const withoutQuery = "The route itself, which the query key carries without the query string.";
    const withParamsKey = `${key} The parameters ride beside it.`;
    const paramsArg = `params${target.paramsOptional ? "?" : ""}: ${target.paramsType}`;
    const withParams = [...this.pathArguments(target, imports), paramsArg].join(", ");
    const pathFn = `${target.name}Path`;
    emitted.push(
      `${docLine(withoutQuery)}const ${pathFn} = (${pathArgs}): string => ${template};

${docLine(route)}export const get${name}Url = (${withParams}): string => {
  const query = toQueryString(params);
  const path = ${pathFn}(${pathCall});
  return query === '' ? path : \`\${path}?\${query}\`;
};
`,
    );
    if (target.isQuery) {
      emitted.push(
        `${docLine(withParamsKey)}export const get${name}QueryKey = (${withParams}) =>
  [${pathFn}(${pathCall}), ...(params ? [params] : [])] as const;
`,
      );
    }
    return emitted;
  }

  /** The request itself, which is the only place a URL and a body are put together. */
  private request(target: EndpointTarget, imports: FileImports): string {
    const args = this.pathArguments(target, imports).map((argument) => `  ${argument},`);
    if (target.body) {
      args.push(`  ${target.body.argument}: ${this.types.value(target.body.ref, imports)},`);
    }
    if (target.paramsType) {
      args.push(`  params${target.paramsOptional ? "?" : ""}: ${target.paramsType},`);
    }
    args.push("  options?: Parameters<typeof customFetch>[1],");

    const urlArgs = [
      ...target.pathParams.map((param) => param.name),
      ...(target.paramsType && !target.multipart ? ["params"] : []),
    ].join(", ");

    const init = ["    ...options,", `    method: '${target.operation.method}',`];
    if (target.body) {
      init.push(
        "    headers: { 'Content-Type': 'application/json', ...options?.headers },",
        `    body: JSON.stringify(${target.body.argument}),`,
      );
    } else if (target.multipart) {
      // The boundary belongs to whoever writes the body: naming the content type by hand omits it.
      init.push("    body: toFormData(params),");
    }

    return `${docLine(target.operation.summary)}export const ${target.name} = async (
${args.join("\n")}
): Promise<${target.responseType}> =>
  customFetch<${target.responseType}>(get${target.pascal}Url(${urlArgs}), {
${init.join("\n")}
  });
`;
  }

  /** The path parameters as declared arguments, typed as the IR carries them. */
  private pathArguments(target: EndpointTarget, imports: FileImports): string[] {
    return target.pathParams.map(
      (param) => `${param.name}: ${this.types.value(param.type, imports)}`,
    );
  }
}

/** A doc comment on its own line, or nothing at all when there is nothing to say. */
function docLine(text: string | undefined): string {
  const doc = jsDoc(text);
  return doc === "" ? "" : `${doc}\n`;
}

/** One line, and never a sequence that would close the comment early. */
export function jsDoc(text: string | undefined): string {
  if (!text) return "";
  const oneLine = text.replace(/\s+/g, " ").replace(/\*\//g, "*\\/").trim();
  return oneLine === "" ? "" : `/** ${oneLine} */`;
}
