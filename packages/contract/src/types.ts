import type { z } from "zod";
import type { QueryBuilder } from "./helpers/query-types.js";

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
 * CRUD role identifier. Used for automatic mapping between operation names
 * and their semantic roles (list, get, create, update, delete, tree).
 *
 * Operations named after a CRUD role are automatically mapped; custom names
 * require an explicit `role` property.
 *
 * @see {@link EntityOperationDef.role} for explicit role assignment.
 */
export type CrudRole = "list" | "get" | "create" | "update" | "delete" | "tree";

/**
 * Defines a single API operation within an entity.
 *
 * Each operation maps to a specific HTTP endpoint. Operations can have
 * a CRUD role (auto-mapped by name or explicitly set) that determines
 * how the framework derives hooks, mock handlers, and client methods.
 *
 * @typeParam TInput - Zod schema for the request payload.
 * @typeParam TOutput - Zod schema for the response payload.
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import type { EntityOperationDef } from "@simplix-react/contract";
 *
 * const listOp: EntityOperationDef = {
 *   method: "GET",
 *   path: "/products",
 * };
 *
 * const archiveOp: EntityOperationDef = {
 *   method: "POST",
 *   path: "/products/:id/archive",
 *   input: z.object({ reason: z.string() }),
 * };
 * ```
 *
 * @see {@link EntityDefinition.operations} where these are declared.
 */
export interface EntityOperationDef<
  TInput extends z.ZodType = z.ZodType,
  TOutput extends z.ZodType = z.ZodType,
> {
  /** HTTP method for this operation. */
  method: HttpMethod;
  /** URL path with optional `:paramName` placeholders (e.g. `"/products/:id"`). */
  path: string;
  /** CRUD role. When omitted, inferred from the operation name if it matches a standard CRUD name. */
  role?: CrudRole;
  /** Zod schema validating the request payload. Optional for GET/DELETE operations. */
  input?: TInput;
  /** Zod schema validating the response payload. When omitted, falls back to the entity's `schema`. */
  output?: TOutput;
  /**
   * Returns query key arrays that should be invalidated after this operation succeeds.
   * Enables automatic cache invalidation in `@simplix-react/react`.
   */
  invalidates?: (
    queryKeys: Record<string, QueryKeyFactory>,
    params: Record<string, string>,
  ) => readonly unknown[][];
  /** Content type for the request body. Defaults to `"json"`. */
  contentType?: "json" | "multipart";
  /** Expected response format. Defaults to `"json"`. */
  responseType?: "json" | "blob";
}

/**
 * Tree response node wrapping entity data with recursive children.
 *
 * Used by `tree` role operations to represent hierarchical structures
 * such as categories, org charts, or folder trees.
 *
 * @typeParam T - The entity data type.
 */
export interface TreeNode<T> {
  /** The entity data for this node. */
  data: T;
  /** Child nodes in the hierarchy. */
  children: TreeNode<T>[];
}

/**
 * Defines an API entity with a flexible operations map.
 *
 * Each entity groups related API operations under a logical name. Operations
 * can include standard CRUD endpoints and any number of custom actions.
 * The framework derives clients, hooks, mock handlers, and form hooks
 * from this definition.
 *
 * @typeParam TSchema - Zod schema for the entity's response shape.
 * @typeParam TOperations - Map of operation names to their definitions.
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import type { EntityDefinition } from "@simplix-react/contract";
 *
 * const productEntity: EntityDefinition = {
 *   schema: z.object({ id: z.string(), name: z.string(), price: z.number() }),
 *   operations: {
 *     list:   { method: "GET",    path: "/products" },
 *     get:    { method: "GET",    path: "/products/:id" },
 *     create: { method: "POST",   path: "/products", input: createSchema },
 *     update: { method: "PUT",    path: "/products/:id", input: updateSchema },
 *     delete: { method: "DELETE", path: "/products/:id" },
 *     archive: { method: "POST",  path: "/products/:id/archive", input: archiveSchema },
 *   },
 * };
 * ```
 *
 * @see {@link EntityOperationDef} for individual operation definitions.
 * @see {@link OperationDefinition} for standalone (non-entity) operations.
 */
export interface EntityDefinition<
  TSchema extends z.ZodType = z.ZodType,
  TOperations extends Record<string, EntityOperationDef> = Record<string, EntityOperationDef>,
> {
  /** Zod schema describing the full entity shape returned by the API. */
  schema: TSchema;
  /** Identity field names for cache key management. Defaults to `["id"]`. */
  identity?: string[];
  /** Map of operation names to their definitions. */
  operations: TOperations;
  /** Optional parent resource for nested URL construction. */
  parent?: EntityParent;
  /** Named query scopes for filtering entities by parent relationships. */
  queries?: Record<string, EntityQuery>;
  /** Optional Zod schema for validating list filter parameters. */
  filterSchema?: z.ZodType;
}

/**
 * Standard CRUD operation method defaults. Spread and customize per entity.
 *
 * @example
 * ```ts
 * operations: {
 *   list:   { ...CRUD_OPERATIONS.list,   path: "/products" },
 *   get:    { ...CRUD_OPERATIONS.get,    path: "/products/:id" },
 *   create: { ...CRUD_OPERATIONS.create, path: "/products", input: createSchema },
 *   update: { ...CRUD_OPERATIONS.update, path: "/products/:id", input: updateSchema },
 *   delete: { ...CRUD_OPERATIONS.delete, path: "/products/:id" },
 * }
 * ```
 */
export const CRUD_OPERATIONS = {
  list:   { method: "GET"    as const },
  get:    { method: "GET"    as const },
  create: { method: "POST"   as const },
  update: { method: "PATCH"  as const },
  delete: { method: "DELETE" as const },
} satisfies Record<string, Pick<EntityOperationDef, "method">>;

// ── Operation Definition ──

/**
 * Supported HTTP methods for API operations.
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Defines a custom (non-CRUD) API operation with typed input and output.
 *
 * Covers endpoints that do not fit the entity pattern, such as
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
 * @see {@link EntityOperationDef} for operations inside an entity.
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
 *   domain: "inventory",
 *   basePath: "/api/v1",
 *   entities: {
 *     product: {
 *       schema: productSchema,
 *       operations: {
 *         list:   { method: "GET",    path: "/products" },
 *         get:    { method: "GET",    path: "/products/:id" },
 *         create: { method: "POST",   path: "/products", input: createProductSchema },
 *         update: { method: "PATCH",  path: "/products/:id", input: updateProductSchema },
 *         delete: { method: "DELETE", path: "/products/:id" },
 *       },
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
  /** Logical domain name used as the root segment in query keys (e.g. `"inventory"`). */
  domain: string;
  /** Base URL path prepended to all entity and operation paths (e.g. `"/api/v1"`). */
  basePath: string;
  /** Map of entity names to their operation-based definitions. */
  entities: TEntities;
  /** Optional map of standalone operation names to their definitions. */
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
 * api.queryKeys.product.all;                     // ["inventory", "product"]
 * api.queryKeys.product.lists();                 // ["inventory", "product", "list"]
 * api.queryKeys.product.list({ status: "active" }); // ["inventory", "product", "list", { status: "active" }]
 * api.queryKeys.product.details();               // ["inventory", "product", "detail"]
 * api.queryKeys.product.detail("abc");           // ["inventory", "product", "detail", "abc"]
 * api.queryKeys.product.trees();                 // ["inventory", "product", "tree"]
 * api.queryKeys.product.tree({ rootId: "x" });   // ["inventory", "product", "tree", { rootId: "x" }]
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
  detail: (id: EntityId) => readonly unknown[];
  /** Returns key matching all tree queries: `[domain, entity, "tree"]`. */
  trees: () => readonly unknown[];
  /** Returns key matching a specific tree query with parameters. */
  tree: (params?: Record<string, unknown>) => readonly unknown[];
}

/**
 * Provides a type-safe client for a single entity, derived from its
 * {@link EntityDefinition} operations.
 *
 * Each operation in the entity produces a callable function on the client.
 * Function signatures vary by CRUD role and HTTP method.
 *
 * @typeParam TSchema - Zod schema for the entity's response shape.
 * @typeParam TOperations - Map of operation names to their definitions.
 *
 * @example
 * ```ts
 * import { defineApi } from "@simplix-react/contract";
 *
 * const api = defineApi(config);
 *
 * // Standard CRUD operations
 * const products = await api.client.product.list();
 * const product = await api.client.product.get("product-1");
 * const created = await api.client.product.create({ name: "New" });
 * const updated = await api.client.product.update("product-1", { name: "Updated" });
 * await api.client.product.delete("product-1");
 *
 * // Custom operations
 * await api.client.product.archive("product-1", { reason: "discontinued" });
 * ```
 *
 * @see {@link deriveClient} for the factory function.
 */
export type EntityClient<
  _TSchema extends z.ZodType,
  TOperations extends Record<string, EntityOperationDef>,
> = {
  [K in keyof TOperations]: (...args: unknown[]) => Promise<unknown>;
};

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
      TEntities[K]["operations"]
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

/**
 * Represents an entity identifier that supports both simple string IDs
 * and composite keys (e.g. tenant ID + item ID).
 *
 * @example
 * ```ts
 * // Simple string ID
 * const id: EntityId = "abc-123";
 *
 * // Composite key
 * const compositeId: EntityId = { tenantId: "t1", itemId: "i1" };
 * ```
 */
export type EntityId = string | Record<string, string>;

/** Shorthand for an entity definition with any Zod schema types. */
export type AnyEntityDef = EntityDefinition<z.ZodTypeAny, Record<string, EntityOperationDef>>;

/** Shorthand for an operation definition with any Zod schema types. */
export type AnyOperationDef = OperationDefinition<z.ZodTypeAny, z.ZodTypeAny>;
