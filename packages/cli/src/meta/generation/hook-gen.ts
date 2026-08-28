import type { OpenApiNamingStrategy } from "../../openapi/naming/naming-strategy.js";
import type { ResolvedDomain } from "../resolve.js";
import { HEADER } from "./emit.js";
import {
  ENDPOINT_DIR,
  MUTATOR_MODULE,
  jsDoc,
  modelImportLines,
  newImports,
  resolveEndpoints,
  TypeWriter,
  type EndpointEntity,
  type EndpointTarget,
  type FileImports,
  dedupeByName,
} from "./endpoint-gen.js";

/** Directory the hook modules land in, relative to a generated package's meta output. */
export const HOOK_DIR = "hooks";

/** Where the model declarations live, seen from a module of {@link HOOK_DIR}. */
const MODEL_DIR = "../model";

/** Where the request functions live, seen from a module of {@link HOOK_DIR}. */
const ENDPOINTS_DIR = `../${ENDPOINT_DIR}`;

/**
 * The mutator, seen from a module of {@link HOOK_DIR}. The hooks and the endpoints sit at the
 * same depth under the meta output root, so both reach it by the same specifier.
 */
const HOOK_MUTATOR_MODULE = MUTATOR_MODULE;

export interface HookGenOptions {
  /** Contributed by the spec profile, and the same one the endpoints were generated with. */
  naming: OpenApiNamingStrategy;
}

/** One entity's hooks, keyed by the CRUD role each answers — what `crud.config.ts` records. */
export interface EntityHooks {
  tag: string;
  entity: string;
  /** Role → the hook's name without its `use` prefix, which is how `crud.config.ts` stores it. */
  roles: Record<string, string>;
}

export interface HookGenResult {
  /** Path relative to the meta output root → file content. */
  files: Map<string, string>;
  entities: EntityHooks[];
}

/**
 * Emit one React Query module per entity of a domain closure, and the barrel over them.
 *
 * A GET is read through `useQuery` and everything else written through `useMutation`, and both
 * are handed the result of the request function untouched: the list adapter reads `content` and
 * `totalElements` off the page the mutator returned, and `useCrudList` reads `isPaused` and
 * `failureCount` off the query itself to tell an unreachable server from an empty table. A hook
 * that reshapes either of those compiles and reports "no data" while the network is down.
 */
export function generateHookFiles(domain: ResolvedDomain, options: HookGenOptions): HookGenResult {
  const entities = resolveEndpoints(domain, options.naming);
  const emitter = new HookEmitter(domain);

  const files = new Map<string, string>();
  for (const entity of entities) {
    files.set(`${HOOK_DIR}/${entity.file}.ts`, emitter.entityFile(entity));
  }
  files.set(`${HOOK_DIR}/index.ts`, barrel(entities));

  return { files, entities: entities.map(rolesOf) };
}

/** The barrel over the directory, which every module of it is reachable through. */
function barrel(entities: EndpointEntity[]): string {
  const modules = entities.map((entity) => entity.file).sort();
  return [HEADER, "", ...modules.map((name) => `export * from './${name}';`), ""].join("\n");
}

/**
 * One entity's roles. A role two operations answer keeps the first: the scaffolder resolves a
 * role to exactly one hook, and the duplicate is already reported by the endpoint generator.
 */
function rolesOf(entity: EndpointEntity): EntityHooks {
  const roles: Record<string, string> = {};
  for (const target of dedupeByName(entity.targets)) {
    if (roles[target.role] === undefined) roles[target.role] = target.name;
  }
  return { tag: entity.tag, entity: entity.entity, roles };
}

/**
 * Names a module takes, split by whether they survive to runtime. A type imported in a value
 * import survives erasure and the emitted module then asks its dependency for an export that was
 * never a value, which fails when the package is loaded rather than when it is built.
 */
interface SplitImports {
  values: Set<string>;
  types: Set<string>;
}

/** The React Query names a module takes. */
type QueryImports = SplitImports;

/** The names a hook module takes from its entity's endpoints module. */
type EndpointImports = SplitImports;

/** One import statement, its names one per line and in a settled order. */
function namedImport(keyword: string, names: Set<string>, module: string): string {
  const listed = [...names]
    .sort()
    .map((name) => `  ${name},`)
    .join("\n");
  return `${keyword} {\n${listed}\n} from '${module}';`;
}

class HookEmitter {
  private readonly types: TypeWriter;

  constructor(domain: ResolvedDomain) {
    this.types = new TypeWriter(domain);
  }

  /** One entity's module: a hook per operation, over the request functions of the same entity. */
  entityFile(entity: EndpointEntity): string {
    const imports = newImports();
    const query: QueryImports = { values: new Set(), types: new Set(["QueryClient"]) };
    const endpoints: EndpointImports = { values: new Set(), types: new Set() };
    // `BodyType` is what the mutator calls a request body, and an entity that writes nothing
    // never names one.
    const mutator = new Set(["customFetch", "ErrorType"]);
    if (entity.targets.some((target) => !target.isQuery && target.body !== undefined)) {
      mutator.add("BodyType");
    }
    const bodies = entity.targets.map((target) =>
      target.isQuery
        ? this.queryHook(target, imports, query, endpoints)
        : this.mutationHook(target, imports, query, endpoints),
    );

    const lines = [
      HEADER,
      "",
      namedImport("import", query.values, "@tanstack/react-query"),
      namedImport("import type", query.types, "@tanstack/react-query"),
      ...modelImportLines(imports, MODEL_DIR),
      `import type { ${[...mutator].sort().join(", ")} } from '${HOOK_MUTATOR_MODULE}';`,
      namedImport("import", endpoints.values, `${ENDPOINTS_DIR}/${entity.file}`),
      ...(endpoints.types.size > 0
        ? [namedImport("import type", endpoints.types, `${ENDPOINTS_DIR}/${entity.file}`)]
        : []),
      "",
    ];
    return [...lines, ...bodies].join("\n");
  }

  /**
   * A read.
   *
   * The path parameters come first, then the options, then the query client — the positions the
   * generated widgets call it at. `useGetXForEdit(id, { query: { gcTime: 0 } })` is how an edit
   * form asks for an uncached record, so options anywhere else are silently ignored and the form
   * serves whatever the cache holds.
   */
  private queryHook(
    target: EndpointTarget,
    imports: FileImports,
    query: QueryImports,
    endpoints: EndpointImports,
  ): string {
    query.values.add("useQuery");
    query.types.add("QueryFunction").add("UseQueryOptions").add("UseQueryResult");
    endpoints.values.add(target.name).add(`get${target.pascal}QueryKey`);

    const resolved = `Awaited<ReturnType<typeof ${target.name}>>`;
    const args = target.pathParams.map(
      (param) => `  ${param.name}: ${this.types.value(param.type, imports)},`,
    );
    const call = target.pathParams.map((param) => param.name);
    if (target.paramsType) {
      args.push(`  params${target.paramsOptional ? "?" : ""}: ${target.paramsType},`);
      call.push("params");
      this.paramsImport(target, imports, endpoints);
    }

    // A read of one record is asked for before the id is known, so the query waits for it rather
    // than fetching `/undefined`. A caller's own `enabled` still wins: it is spread after.
    const guard = target.pathParams
      .map((param) => `${param.name} !== null && ${param.name} !== undefined`)
      .join(" && ");
    const enabled = guard === "" ? "" : `\n      enabled: ${guard},`;

    return `${doc(target)}export function use${target.pascal}<
  TData = ${resolved},
  TError = ErrorType<unknown>,
>(
${args.join("\n")}
  options?: {
    query?: Partial<UseQueryOptions<${resolved}, TError, TData>>;
    request?: Parameters<typeof customFetch>[1];
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? get${target.pascal}QueryKey(${call.join(", ")});
  const queryFn: QueryFunction<${resolved}> = ({ signal }) =>
    ${target.name}(${[...call, "{ signal, ...requestOptions }"].join(", ")});

  return useQuery(
    {
      queryKey,
      queryFn,${enabled}
      ...queryOptions,
    } as UseQueryOptions<${resolved}, TError, TData>,
    queryClient,
  ) as UseQueryResult<TData, TError>;
}
`;
  }

  /**
   * A write.
   *
   * Everything it is called with rides in one variables object — the path parameters beside
   * `data`, never inside it — because that is what the CRUD adapters build: a create sends
   * `{ data }`, an update `{ [pathParam]: id, data }` and a delete `{ [pathParam]: id }`.
   */
  private mutationHook(
    target: EndpointTarget,
    imports: FileImports,
    query: QueryImports,
    endpoints: EndpointImports,
  ): string {
    query.values.add("useMutation");
    query.types.add("MutationFunction").add("UseMutationOptions").add("UseMutationResult");
    endpoints.values.add(target.name);

    const resolved = `Awaited<ReturnType<typeof ${target.name}>>`;
    const members: string[] = target.pathParams.map(
      (param) => `  ${param.name}: ${this.types.value(param.type, imports)};`,
    );
    const bound: string[] = target.pathParams.map((param) => param.name);
    if (target.body) {
      members.push(`  data: BodyType<${this.types.value(target.body.ref, imports)}>;`);
      bound.push("data");
    }
    if (target.paramsType) {
      members.push(`  params${target.paramsOptional ? "?" : ""}: ${target.paramsType};`);
      bound.push("params");
      this.paramsImport(target, imports, endpoints);
    }

    const variables = members.length === 0 ? "void" : `${target.pascal}Variables`;
    const declaration =
      members.length === 0
        ? ""
        : `${jsDoc(`What \`use${target.pascal}\` is called with.`)}
export type ${variables} = {
${members.join("\n")}
};

`;
    const call = [...bound, "requestOptions"].join(", ");
    const takes = members.length === 0 ? "()" : `({ ${bound.join(", ")} })`;

    return `${declaration}${doc(target)}export const use${target.pascal} = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<${resolved}, TError, ${variables}, TContext>;
    request?: Parameters<typeof customFetch>[1];
  },
  queryClient?: QueryClient,
): UseMutationResult<${resolved}, TError, ${variables}, TContext> => {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};
  const mutationFn: MutationFunction<${resolved}, ${variables}> = ${takes} =>
    ${target.name}(${call});

  const merged: UseMutationOptions<${resolved}, TError, ${variables}, TContext> = {
    mutationKey: ['${target.name}'],
    mutationFn,
    ...mutationOptions,
  };
  return useMutation(merged, queryClient);
};
`;
  }
  /**
   * Where a params type is taken from: its own entity's endpoints module when this pair of
   * generators declared it, and the model directory when the search generator did.
   */
  private paramsImport(
    target: EndpointTarget,
    imports: FileImports,
    endpoints: EndpointImports,
  ): void {
    if (target.paramsType === undefined) return;
    if (target.paramsDeclared) endpoints.types.add(target.paramsType);
    else imports.models.add(target.paramsType);
  }
}

/** What the operation says it does, above the hook that does it. */
function doc(target: EndpointTarget): string {
  const summary = jsDoc(target.operation.summary);
  return summary === "" ? "" : `${summary}\n`;
}
