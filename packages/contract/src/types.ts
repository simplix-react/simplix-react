import type { z } from "zod";
import type { QueryBuilder, ListParams } from "./helpers/query-types.js";

// ── Entity Definition ──

/**
 * Describes the parent resource in a nested entity relationship.
 *
 * Enables hierarchical URL construction such as `/projects/:projectId/tasks`.
 *
 * @example
 * ```ts
 * const parent: EntityParent = {
 *   param: "projectId",
 *   path: "/projects",
 * };
 * // Produces: /projects/:projectId/tasks
 * ```
 *
 * @see {@link EntityDefinition} for the entity that references this parent.
 */
export interface EntityParent {
  /** Route parameter name used to identify the parent resource (e.g. `"projectId"`). */
  param: string;
  /** Base path segment for the parent resource (e.g. `"/projects"`). */
  path: string;
}

/**
 * Represents a named query scope that filters entities by a parent relationship.
 *
 * Allows defining reusable query patterns like "tasks by project" that can be
 * referenced throughout the application.
 *
 * @see {@link EntityDefinition.queries} where these are declared.
 */
export interface EntityQuery {
  /** Name of the parent entity this query filters by (e.g. `"project"`). */
  parent: string;
  /** Route parameter name used to scope the query (e.g. `"projectId"`). */
  param: string;
}

/**
 * Defines a CRUD-capable API entity with Zod schemas for type-safe validation.
 *
 * Serves as the single source of truth for an entity's shape, creation payload,
 * update payload, and URL structure. The framework derives API clients, React Query
 * hooks, and MSW handlers from this definition.
 *
 * @typeParam TSchema - Zod schema for the entity's response shape.
 * @typeParam TCreate - Zod schema for the creation payload.
 * @typeParam TUpdate - Zod schema for the update (partial) payload.
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import type { EntityDefinition } from "@simplix-react/contract";
 *
 * const taskEntity: EntityDefinition = {
 *   path: "/tasks",
 *   schema: z.object({ id: z.string(), title: z.string() }),
 *   createSchema: z.object({ title: z.string() }),
 *   updateSchema: z.object({ title: z.string().optional() }),
 *   parent: { param: "projectId", path: "/projects" },
 * };
 * ```
 *
 * @see {@link OperationDefinition} for non-CRUD custom operations.
 * @see {@link @simplix-react/react!deriveHooks | deriveHooks} for deriving React Query hooks.
 * @see {@link @simplix-react/mock!deriveMockHandlers | deriveMockHandlers} for deriving MSW handlers.
 */
export interface EntityDefinition<
  TSchema extends z.ZodType = z.ZodType,
  TCreate extends z.ZodType = z.ZodType,
  TUpdate extends z.ZodType = z.ZodType,
> {
  /** URL path segment for this entity (e.g. `"/tasks"`). */
  path: string;
  /** Zod schema describing the full entity shape returned by the API. */
  schema: TSchema;
  /** Zod schema describing the payload required to create a new entity. */
  createSchema: TCreate;
  /** Zod schema describing the payload for updating an existing entity. */
  updateSchema: TUpdate;
  /** Optional parent resource for nested URL construction. */
  parent?: EntityParent;
  /** Named query scopes for filtering entities by parent relationships. */
  queries?: Record<string, EntityQuery>;
  /** Optional Zod schema for validating list filter parameters. */
  filterSchema?: z.ZodType;
}

// ── Operation Definition ──

/**
 * Supported HTTP methods for API operations.
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Defines a custom (non-CRUD) API operation with typed input and output.
 *
 * Covers endpoints that do not fit the standard entity CRUD pattern, such as
 * file uploads, batch operations, or RPC-style calls. Path parameters use
 * the `:paramName` syntax and are positionally mapped to function arguments.
 *
 * @typeParam TInput - Zod schema for the request payload.
 * @typeParam TOutput - Zod schema for the response payload.
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import type { OperationDefinition } from "@simplix-react/contract";
 *
 * const assignTask: OperationDefinition = {
 *   method: "POST",
 *   path: "/tasks/:taskId/assign",
 *   input: z.object({ userId: z.string() }),
 *   output: z.object({ id: z.string(), assigneeId: z.string() }),
 * };
 * ```
 *
 * @see {@link EntityDefinition} for standard CRUD entities.
 */
export interface OperationDefinition<
  TInput extends z.ZodType = z.ZodType,
  TOutput extends z.ZodType = z.ZodType,
> {
  /** HTTP method for this operation. */
  method: HttpMethod;
  /** URL path with optional `:paramName` placeholders (e.g. `"/tasks/:taskId/assign"`). */
  path: string;
  /** Zod schema validating the request payload. */
  input: TInput;
  /** Zod schema validating the response payload. */
  output: TOutput;
  /** Content type for the request body. Defaults to `"json"`. */
  contentType?: "json" | "multipart";
  /** Expected response format. Defaults to `"json"`. */
  responseType?: "json" | "blob";
  /**
   * Returns query key arrays that should be invalidated after this operation succeeds.
   * Enables automatic cache invalidation in `@simplix-react/react`.
   */
  invalidates?: (
    queryKeys: Record<string, QueryKeyFactory>,
    params: Record<string, string>,
  ) => readonly unknown[][];
}

// ── API Contract Config ──

/**
 * Configures a complete API contract with entities, operations, and shared settings.
 *
 * Serves as the input to {@link defineApi}, grouping all entity and operation
 * definitions under a single domain namespace with a shared base path.
 *
 * @typeParam TEntities - Map of entity names to their definitions.
 * @typeParam TOperations - Map of operation names to their definitions.
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import { simpleQueryBuilder } from "@simplix-react/contract";
 * import type { ApiContractConfig } from "@simplix-react/contract";
 *
 * const config: ApiContractConfig = {
 *   domain: "project",
 *   basePath: "/api/v1",
 *   entities: {
 *     task: {
 *       path: "/tasks",
 *       schema: z.object({ id: z.string(), title: z.string() }),
 *       createSchema: z.object({ title: z.string() }),
 *       updateSchema: z.object({ title: z.string().optional() }),
 *     },
 *   },
 *   queryBuilder: simpleQueryBuilder,
 * };
 * ```
 *
 * @see {@link defineApi} for constructing a contract from this config.
 */
export interface ApiContractConfig<
  TEntities extends Record<string, EntityDefinition> = Record<
    string,
    EntityDefinition
  >,
  TOperations extends Record<string, OperationDefinition> = Record<
    string,
    OperationDefinition
  >,
> {
  /** Logical domain name used as the root segment in query keys (e.g. `"project"`). */
  domain: string;
  /** Base URL path prepended to all entity and operation paths (e.g. `"/api/v1"`). */
  basePath: string;
  /** Map of entity names to their CRUD definitions. */
  entities: TEntities;
  /** Optional map of custom operation names to their definitions. */
  operations?: TOperations;
  /** Strategy for serializing list parameters (filters, sort, pagination) into URL search params. */
  queryBuilder?: QueryBuilder;
}

// ── Derived Types ──

/**
 * Provides structured query key generators for a single entity, following the
 * query key factory pattern recommended by TanStack Query.
 *
 * Generated automatically by {@link deriveQueryKeys} and used by `@simplix-react/react`
 * to manage cache granularity and invalidation.
 *
 * @example
 * ```ts
 * import { defineApi } from "@simplix-react/contract";
 *
 * const api = defineApi(config);
 *
 * api.queryKeys.task.all;              // ["project", "task"]
 * api.queryKeys.task.lists();          // ["project", "task", "list"]
 * api.queryKeys.task.list({ status: "open" }); // ["project", "task", "list", { status: "open" }]
 * api.queryKeys.task.details();        // ["project", "task", "detail"]
 * api.queryKeys.task.detail("abc");    // ["project", "task", "detail", "abc"]
 * ```
 *
 * @see {@link deriveQueryKeys} for the factory function.
 */
export interface QueryKeyFactory {
  /** Root key matching all queries for this entity: `[domain, entity]`. */
  all: readonly unknown[];
  /** Returns key matching all list queries: `[domain, entity, "list"]`. */
  lists: () => readonly unknown[];
  /** Returns key matching a specific list query with parameters. */
  list: (params: Record<string, unknown>) => readonly unknown[];
  /** Returns key matching all detail queries: `[domain, entity, "detail"]`. */
  details: () => readonly unknown[];
  /** Returns key matching a specific detail query by ID. */
  detail: (id: string) => readonly unknown[];
}

/**
 * Provides a type-safe CRUD client for a single entity, derived from its
 * {@link EntityDefinition} schemas.
 *
 * All methods infer request/response types directly from the Zod schemas,
 * ensuring compile-time safety without manual type annotations.
 *
 * @typeParam TSchema - Zod schema for the entity's response shape.
 * @typeParam TCreate - Zod schema for the creation payload.
 * @typeParam TUpdate - Zod schema for the update payload.
 *
 * @example
 * ```ts
 * import { defineApi } from "@simplix-react/contract";
 *
 * const api = defineApi(config);
 *
 * // All methods are fully typed based on entity schemas
 * const tasks = await api.client.task.list();
 * const task = await api.client.task.get("task-1");
 * const created = await api.client.task.create({ title: "New task" });
 * const updated = await api.client.task.update("task-1", { title: "Updated" });
 * await api.client.task.delete("task-1");
 * ```
 *
 * @see {@link deriveClient} for the factory function.
 */
export interface EntityClient<
  TSchema extends z.ZodType,
  TCreate extends z.ZodType,
  TUpdate extends z.ZodType,
> {
  /** Fetches a list of entities, optionally scoped by parent ID and/or list parameters. */
  list: (
    parentIdOrParams?: string | ListParams,
    params?: ListParams,
  ) => Promise<z.infer<TSchema>[]>;
  /** Fetches a single entity by its ID. */
  get: (id: string) => Promise<z.infer<TSchema>>;
  /** Creates a new entity, optionally under a parent resource. */
  create: (
    parentIdOrDto: string | z.infer<TCreate>,
    dto?: z.infer<TCreate>,
  ) => Promise<z.infer<TSchema>>;
  /** Partially updates an existing entity by ID. */
  update: (id: string, dto: z.infer<TUpdate>) => Promise<z.infer<TSchema>>;
  /** Deletes an entity by its ID. */
  delete: (id: string) => Promise<void>;
}

/**
 * Represents a customizable fetch function signature.
 *
 * Allows replacing the default HTTP client with a custom implementation
 * (e.g. for authentication headers, retry logic, or testing).
 *
 * @typeParam T - The expected response type after deserialization.
 *
 * @see {@link defaultFetch} for the built-in implementation.
 * @see {@link defineApi} where this is provided via `options.fetchFn`.
 */
export type FetchFn = <T>(path: string, options?: RequestInit) => Promise<T>;

// ── API Contract Result ──

/**
 * Represents the fully constructed API contract returned by {@link defineApi}.
 *
 * Contains the original configuration, a type-safe HTTP client, and query key
 * factories for all registered entities. This is the primary interface consumed
 * by `@simplix-react/react` and `@simplix-react/mock`.
 *
 * @typeParam TEntities - Map of entity names to their definitions.
 * @typeParam TOperations - Map of operation names to their definitions.
 *
 * @see {@link defineApi} for constructing this contract.
 * @see {@link @simplix-react/react!deriveHooks | deriveHooks} for deriving React hooks.
 * @see {@link @simplix-react/mock!deriveMockHandlers | deriveMockHandlers} for deriving mock handlers.
 */
export interface ApiContract<
  TEntities extends Record<string, EntityDefinition>,
  TOperations extends Record<string, OperationDefinition>,
> {
  /** The original contract configuration. */
  config: ApiContractConfig<TEntities, TOperations>;
  /** Type-safe HTTP client with methods for each entity and operation. */
  client: {
    [K in keyof TEntities]: EntityClient<
      TEntities[K]["schema"],
      TEntities[K]["createSchema"],
      TEntities[K]["updateSchema"]
    >;
  } & {
    [K in keyof TOperations]: TOperations[K] extends OperationDefinition<
      infer _TInput,
      infer TOutput
    >
      ? (...args: unknown[]) => Promise<z.infer<TOutput>>
      : never;
  };
  /** Query key factories for cache management, one per entity. */
  queryKeys: {
    [K in keyof TEntities]: QueryKeyFactory;
  };
}

// ── Shared Type Aliases ──

/** Shorthand for an entity definition with any Zod schema types. */
export type AnyEntityDef = EntityDefinition<z.ZodTypeAny, z.ZodTypeAny, z.ZodTypeAny>;

/** Shorthand for an operation definition with any Zod schema types. */
export type AnyOperationDef = OperationDefinition<z.ZodTypeAny, z.ZodTypeAny>;
