import type { CrudRole } from "@simplix-react/contract";

/**
 * Context provided to {@link OpenApiNamingStrategy.resolveEntityName} for deriving
 * the entity name from an OpenAPI tag group.
 *
 * @remarks
 * Contains the tag name, all paths and operations under that tag, referenced
 * schema names, and any `x-*` extensions from the tag object. The strategy
 * uses this information to produce a camelCase entity name.
 */
export interface EntityNameContext {
  /** OpenAPI tag name — undefined for tag-less specs */
  tag?: string;
  /** All paths belonging to this tag */
  paths: string[];
  /** Operation summaries under this tag */
  operations: Array<{
    operationId: string;
    method: string;
    path: string;
    summary?: string;
    queryParams?: string[];
  }>;
  /** DTO/schema names referenced by operations in this tag */
  schemaNames: string[];
  /** x-* extensions from the OpenAPI tag object */
  extensions: Record<string, unknown>;
}

/**
 * Context provided to `resolveOperation()` for mapping an OpenAPI operation
 * to a CRUD role and a human-friendly hook name.
 */
export interface OperationContext {
  /** operationId (may be auto-generated with numeric suffixes) */
  operationId: string;
  /** HTTP method (uppercase: GET, POST, PUT, DELETE, PATCH) */
  method: string;
  /** Full path (e.g., "/api/v1/admin/user/account/{userId}") */
  path: string;
  /** Tag this operation belongs to */
  tag?: string;
  /** Entity name resolved by resolveEntityName() (camelCase) */
  entityName: string;
  /** Operation summary from the spec */
  summary?: string;
  /** Operation description from the spec */
  description?: string;
  /** 200 response schema name */
  responseType?: string;
  /** Request body schema name */
  requestType?: string;
  /** Path parameter names */
  pathParams: string[];
  /** Query parameter names */
  queryParams: string[];
  /** x-* extensions from the operation object */
  extensions: Record<string, unknown>;
}

/**
 * Result of resolving an operation — determines its CRUD role and hook name.
 */
export interface ResolvedOperation {
  /** CRUD role — standard roles (list, get, create, update, delete, getForEdit) or extended roles (search, batchUpdate, batchDelete, multiUpdate, order, etc.) */
  role: string;
  /** Hook name without "use" prefix — Orval adds it automatically */
  hookName: string;
}

/**
 * Strategy interface for per-spec naming customization.
 *
 * @remarks
 * Injected into the CLI pipeline to control how entity names and operation
 * hook names are derived from OpenAPI tags and operations. Each {@link SpecProfile}
 * includes a naming strategy.
 *
 * @example
 * ```ts
 * import type { OpenApiNamingStrategy } from "@simplix-react/cli";
 *
 * const strategy: OpenApiNamingStrategy = {
 *   resolveEntityName: (ctx) => camelCase(ctx.tag ?? "unknown"),
 *   resolveOperation: (ctx) => ({
 *     role: inferRole(ctx.method, ctx.path),
 *     hookName: camelCase(ctx.operationId),
 *   }),
 * };
 * ```
 */
export interface OpenApiNamingStrategy {
  /**
   * Derives a camelCase entity name from an OpenAPI tag group.
   *
   * @param context - The tag group context containing tag name, paths, operations, and schemas
   * @returns A camelCase entity name (e.g., `"projectTask"`)
   */
  resolveEntityName(context: EntityNameContext): string;
  /**
   * Maps an OpenAPI operation to a CRUD role and hook name.
   *
   * @param context - The operation context containing method, path, entity name, and schema info
   * @returns A {@link ResolvedOperation} with the determined role and hook name
   */
  resolveOperation(context: OperationContext): ResolvedOperation;
}
