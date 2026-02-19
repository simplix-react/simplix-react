import { HttpResponse, http } from "msw";
import {
  camelToSnake,
  type AnyEntityDef,
  type AnyOperationDef,
  type ApiContractConfig,
  type EntityOperationDef,
} from "@simplix-react/contract";
import { resolveRole } from "@simplix-react/contract";
import { getEntityStore, getNextId } from "./mock-store.js";
import { mockSuccess, mockFailure, type MockResult } from "./mock-result.js";
import { buildTreeFromFlatRows } from "./tree-builder.js";

/**
 * Provides per-entity configuration for mock handler generation.
 *
 * Allows overriding pagination limits, sort order, relation loading,
 * and custom operation resolvers for a specific entity.
 *
 * @example
 * ```ts
 * import type { MockEntityConfig } from "@simplix-react/mock";
 *
 * const taskConfig: MockEntityConfig = {
 *   defaultLimit: 20,
 *   maxLimit: 100,
 *   defaultSort: "createdAt:desc",
 *   relations: {
 *     project: {
 *       entity: "project",
 *       localKey: "projectId",
 *       type: "belongsTo",
 *     },
 *   },
 * };
 * ```
 *
 * @see {@link deriveMockHandlers} - Consumes this config per entity.
 */
export interface MockEntityConfig {
  /**
   * Default number of rows per page.
   *
   * @defaultValue 50
   */
  defaultLimit?: number;
  /**
   * Maximum allowed rows per page.
   *
   * @defaultValue 100
   */
  maxLimit?: number;
  /**
   * Default sort in `"field:direction"` format (camelCase).
   *
   * @defaultValue `"createdAt:desc"`
   */
  defaultSort?: string;
  /** Map of relation names to their `belongsTo` join configuration. */
  relations?: Record<string, {
    entity: string;
    localKey: string;
    foreignKey?: string;
    type: "belongsTo";
  }>;
  /** Custom resolvers for non-CRUD operations, keyed by operation name. */
  resolvers?: Record<string, (info: {
    request: Request;
    params: Record<string, string>;
  }) => Promise<Response> | Response>;
}

// MSW method mapping
const MSW_METHOD_MAP = {
  GET: http.get,
  POST: http.post,
  PUT: http.put,
  PATCH: http.patch,
  DELETE: http.delete,
} as const;

/**
 * Derives MSW request handlers from an {@link @simplix-react/contract!ApiContractConfig}.
 *
 * Generates handlers for every operation in each entity based on its CRUD role:
 *
 * - **list** (GET) — supports query-param filtering, sorting, and offset-based pagination
 * - **get** (GET) — supports `belongsTo` relation loading
 * - **create** (POST) — auto-generates a numeric `id` when not provided
 * - **update** (PATCH/PUT) — partial updates with automatic `updatedAt` timestamp
 * - **delete** (DELETE) — removes the record by `id`
 * - **tree** (GET) — returns recursive hierarchical data
 * - **custom** — returns default 200 response, or uses custom resolver if provided
 *
 * All handlers read from and write to the in-memory store managed by
 * {@link getEntityStore}.
 *
 * @typeParam TEntities - The entities map from the contract config.
 * @typeParam TOperations - The operations map from the contract config.
 * @param config - The API contract configuration object.
 * @param mockConfig - Optional per-entity mock configuration keyed by entity name.
 * @returns An array of MSW `HttpHandler` instances ready for use with `setupWorker`.
 *
 * @example
 * ```ts
 * import { deriveMockHandlers } from "@simplix-react/mock";
 * import { inventoryContract } from "./contract";
 *
 * const handlers = deriveMockHandlers(inventoryContract.config, {
 *   product: { defaultLimit: 20 },
 * });
 * ```
 *
 * @see {@link MockEntityConfig} - Per-entity configuration options.
 * @see {@link setupMockWorker} - High-level bootstrap that accepts these handlers.
 */
export function deriveMockHandlers<
  TEntities extends Record<string, AnyEntityDef>,
  TOperations extends Record<string, AnyOperationDef>,
>(
  config: ApiContractConfig<TEntities, TOperations>,
  mockConfig?: Record<string, MockEntityConfig>,
) {
  const handlers: ReturnType<typeof http.get>[] = [];
  const { basePath, entities } = config;

  for (const [name, entity] of Object.entries(entities) as [string, AnyEntityDef][]) {
    const entityConfig = mockConfig?.[name];
    const storeName = `${config.domain}_${camelToSnake(name)}`;
    const defaultLimit = entityConfig?.defaultLimit ?? 50;
    const maxLimit = entityConfig?.maxLimit ?? 100;
    const defaultSort = entityConfig?.defaultSort ?? "createdAt:desc";
    const relations = entityConfig?.relations;
    const customResolvers = entityConfig?.resolvers;

    // Sort operations: static paths before parameterized paths to avoid
    // MSW matching `:param` against literal path segments
    const sortedOps = (Object.entries(entity.operations) as [string, EntityOperationDef][])
      .sort(([, a], [, b]) => {
        const aHasParam = a.path.includes(":");
        const bHasParam = b.path.includes(":");
        if (aHasParam === bHasParam) return 0;
        return aHasParam ? 1 : -1;
      });

    for (const [opName, op] of sortedOps) {
      const role = resolveRole(opName, op);
      const mswMethod = MSW_METHOD_MAP[op.method];
      const fullPath = `${basePath}${op.path}`;

      // Check for custom resolver first
      if (customResolvers?.[opName]) {
        const resolver = customResolvers[opName];
        handlers.push(
          mswMethod(fullPath, async ({ request, params: routeParams }) => {
            return resolver({
              request,
              params: routeParams as Record<string, string>,
            });
          }),
        );
        continue;
      }

      switch (role) {
        case "list": {
          if (entity.parent) {
            const parentListPath = `${basePath}${entity.parent.path}/:${entity.parent.param}${op.path}`;
            handlers.push(
              mswMethod(parentListPath, ({ request, params: routeParams }) => {
                const parentId = routeParams[entity.parent!.param] as string;
                const searchParams = parseSearchParams(request.url);
                searchParams.filters[entity.parent!.param] = parentId;
                return toResponse(
                  queryList(storeName, searchParams, defaultLimit, maxLimit, defaultSort),
                );
              }),
            );
          } else {
            handlers.push(
              mswMethod(fullPath, ({ request }) => {
                const searchParams = parseSearchParams(request.url);
                return toResponse(
                  queryList(storeName, searchParams, defaultLimit, maxLimit, defaultSort),
                );
              }),
            );
          }
          break;
        }

        case "get": {
          handlers.push(
            mswMethod(fullPath, ({ params: routeParams }) => {
              const id = (routeParams as Record<string, string>).id
                ?? Object.values(routeParams as Record<string, string>).pop()
                ?? "";
              if (relations) {
                return toResponse(getByIdWithRelations(storeName, id, relations, config.domain));
              }
              return toResponse(getById(storeName, id));
            }),
          );
          break;
        }

        case "create": {
          if (entity.parent) {
            const parentCreatePath = `${basePath}${entity.parent.path}/:${entity.parent.param}${op.path}`;
            handlers.push(
              mswMethod(parentCreatePath, async ({ request, params: routeParams }) => {
                const dto = (await request.json()) as Record<string, unknown>;
                const parentId = routeParams[entity.parent!.param] as string;
                dto[entity.parent!.param] = parentId;
                return toResponse(insertRecord(storeName, dto), 201);
              }),
            );
          } else {
            handlers.push(
              mswMethod(fullPath, async ({ request }) => {
                const dto = (await request.json()) as Record<string, unknown>;
                return toResponse(insertRecord(storeName, dto), 201);
              }),
            );
          }
          break;
        }

        case "update": {
          handlers.push(
            mswMethod(fullPath, async ({ request, params: routeParams }) => {
              let dto: Record<string, unknown>;
              try {
                dto = (await request.json()) as Record<string, unknown>;
              } catch {
                return HttpResponse.json(
                  { code: "bad_request", message: "Invalid or empty JSON body" },
                  { status: 400 },
                );
              }
              const id = (routeParams as Record<string, string>).id
                ?? Object.values(routeParams as Record<string, string>).pop()
                // Fallback: extract id from request body (e.g. PUT /pet with id in body)
                ?? String(dto.id ?? "");
              return toResponse(updateRecord(storeName, id, dto));
            }),
          );
          break;
        }

        case "delete": {
          handlers.push(
            mswMethod(fullPath, ({ params: routeParams }) => {
              const id = (routeParams as Record<string, string>).id
                ?? Object.values(routeParams as Record<string, string>).pop()
                ?? "";
              return toResponse(deleteRecord(storeName, id));
            }),
          );
          break;
        }

        case "tree": {
          handlers.push(
            mswMethod(fullPath, ({ request }) => {
              const searchParams = parseSearchParams(request.url);
              return toResponse(queryTree(storeName, searchParams, defaultSort));
            }),
          );
          break;
        }

        default: {
          const hasPathParam = op.path.includes(":");
          if (op.method === "GET" && !hasPathParam) {
            // GET without path param → list-like (filter by query params)
            handlers.push(
              mswMethod(fullPath, ({ request }) => {
                const searchParams = parseSearchParams(request.url);
                return toResponse(
                  queryList(storeName, searchParams, defaultLimit, maxLimit, defaultSort),
                );
              }),
            );
          } else if (op.method === "GET" && hasPathParam) {
            // GET with path param → get-like (lookup by last param)
            handlers.push(
              mswMethod(fullPath, ({ params: routeParams }) => {
                const id = Object.values(routeParams as Record<string, string>).pop() ?? "";
                return toResponse(getById(storeName, id));
              }),
            );
          } else if ((op.method === "POST" || op.method === "PUT" || op.method === "PATCH") && !hasPathParam) {
            // POST/PUT/PATCH without path param → create-like
            handlers.push(
              mswMethod(fullPath, async ({ request }) => {
                const body = await request.json().catch(() => ({}));
                if (Array.isArray(body)) {
                  const created = (body as Record<string, unknown>[]).map(
                    (item) => insertRecord(storeName, item),
                  );
                  return toResponse(mockSuccess(created.map((r) => r.data)));
                }
                return toResponse(insertRecord(storeName, body as Record<string, unknown>), 201);
              }),
            );
          } else if ((op.method === "POST" || op.method === "PUT" || op.method === "PATCH") && hasPathParam) {
            // POST/PUT/PATCH with path param → update-like
            handlers.push(
              mswMethod(fullPath, async ({ request, params: routeParams }) => {
                const id = Object.values(routeParams as Record<string, string>).pop() ?? "";
                const dto = await request.json().catch(() => ({})) as Record<string, unknown>;
                return toResponse(updateRecord(storeName, id, dto));
              }),
            );
          } else if (op.method === "DELETE" && hasPathParam) {
            // DELETE with path param → delete-like
            handlers.push(
              mswMethod(fullPath, ({ params: routeParams }) => {
                const id = Object.values(routeParams as Record<string, string>).pop() ?? "";
                return toResponse(deleteRecord(storeName, id));
              }),
            );
          } else {
            // Fallback: return empty success
            handlers.push(
              mswMethod(fullPath, () => {
                return HttpResponse.json({ data: null }, { status: 200 });
              }),
            );
          }
          break;
        }
      }
    }
  }

  return handlers;
}

// ── URL Parsing ──

interface ParsedSearchParams {
  filters: Record<string, string>;
  sort?: string;
  page?: number;
  limit?: number;
  cursor?: string;
}

function parseSearchParams(requestUrl: string): ParsedSearchParams {
  const url = new URL(requestUrl, "http://localhost");
  const filters: Record<string, string> = {};
  let sort: string | undefined;
  let page: number | undefined;
  let limit: number | undefined;
  let cursor: string | undefined;

  url.searchParams.forEach((value, key) => {
    if (key === "sort") {
      sort = value;
    } else if (key === "page") {
      page = parseInt(value, 10);
    } else if (key === "limit") {
      limit = parseInt(value, 10);
    } else if (key === "cursor") {
      cursor = value;
    } else {
      filters[key] = value;
    }
  });

  return { filters, sort, page, limit, cursor };
}

// ── In-Memory Store Helpers ──

function queryList<T>(
  storeName: string,
  searchParams: ParsedSearchParams,
  defaultLimit: number,
  maxLimit: number,
  defaultSort: string,
): MockResult<{ data: T[]; meta?: { total: number; page: number; limit: number; hasNextPage: boolean } }> {
  const store = getEntityStore(storeName);
  let rows = Array.from(store.values());

  for (const [key, value] of Object.entries(searchParams.filters)) {
    rows = rows.filter((row) => String(row[key]) === value);
  }

  const sortStr = searchParams.sort ?? defaultSort;
  rows = applySorting(rows, sortStr);

  const hasPagination = searchParams.page !== undefined || searchParams.cursor !== undefined;
  const limit = Math.min(searchParams.limit ?? defaultLimit, maxLimit);

  if (hasPagination) {
    const total = rows.length;
    const page = searchParams.page ?? 1;
    const offset = (page - 1) * limit;
    const paged = rows.slice(offset, offset + limit);

    return mockSuccess({
      data: paged as T[],
      meta: { total, page, limit, hasNextPage: offset + paged.length < total },
    });
  }

  return mockSuccess({ data: rows as T[] });
}

function getById<T>(storeName: string, id: string): MockResult<T> {
  const store = getEntityStore(storeName);
  const record = store.get(id) ?? store.get(Number(id));
  if (!record) {
    return mockFailure({ code: "not_found", message: `${storeName} not found` });
  }
  return mockSuccess(record as T);
}

function getByIdWithRelations<T>(
  storeName: string,
  id: string,
  relations: Record<string, { entity: string; localKey: string; foreignKey?: string; type: "belongsTo" }>,
  domain: string,
): MockResult<T> {
  const store = getEntityStore(storeName);
  const record = store.get(id) ?? store.get(Number(id));
  if (!record) {
    return mockFailure({ code: "not_found", message: `${storeName} not found` });
  }

  const result = { ...record };

  for (const [relationName, relation] of Object.entries(relations)) {
    const fkValue = record[relation.localKey];
    if (fkValue != null) {
      const relStoreName = `${domain}_${camelToSnake(relation.entity)}`;
      const relStore = getEntityStore(relStoreName);
      const foreignKey = relation.foreignKey ?? "id";
      for (const relRecord of relStore.values()) {
        if (String(relRecord[foreignKey]) === String(fkValue)) {
          result[relationName] = relRecord;
          break;
        }
      }
    }
  }

  return mockSuccess(result as T);
}

function queryTree<T extends Record<string, unknown>>(
  storeName: string,
  searchParams: ParsedSearchParams,
  defaultSort: string,
): MockResult<{ data: unknown[] }> {
  const store = getEntityStore(storeName);
  let rows = Array.from(store.values()) as T[];

  const rootId = searchParams.filters.rootId;
  if (rootId) {
    rows = collectSubtree(rows, rootId);
  }

  const sortStr = searchParams.sort ?? defaultSort;
  rows = applySorting(rows, sortStr) as T[];
  const treeData = buildTreeFromFlatRows(rows);

  return mockSuccess({ data: treeData });
}

function collectSubtree<T extends Record<string, unknown>>(rows: T[], rootId: string): T[] {
  const result: T[] = [];
  const queue: string[] = [rootId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    for (const row of rows) {
      if (String(row.id) === currentId) {
        result.push(row);
      }
      if (String(row.parentId) === currentId && String(row.id) !== currentId) {
        queue.push(String(row.id));
      }
    }
  }

  return result;
}

function insertRecord<T>(storeName: string, dto: Record<string, unknown>): MockResult<T> {
  const store = getEntityStore(storeName);
  const now = new Date().toISOString();

  const record: Record<string, unknown> = { ...dto };
  if (record.id === undefined) {
    record.id = getNextId(storeName);
  }
  if (record.createdAt === undefined) {
    record.createdAt = now;
  }
  if (record.updatedAt === undefined) {
    record.updatedAt = now;
  }

  store.set(record.id as string | number, record);
  return mockSuccess(record as T);
}

function updateRecord<T>(storeName: string, id: string, dto: Record<string, unknown>): MockResult<T> {
  const store = getEntityStore(storeName);
  const existing = store.get(id) ?? store.get(Number(id));
  if (!existing) {
    return mockFailure({ code: "not_found", message: `${storeName} not found` });
  }

  const updated: Record<string, unknown> = {
    ...existing,
    ...dto,
    updatedAt: new Date().toISOString(),
  };
  store.set(existing.id as string | number, updated);
  return mockSuccess(updated as T);
}

function deleteRecord(storeName: string, id: string): MockResult<void> {
  const store = getEntityStore(storeName);
  const deleted = store.delete(id) || store.delete(Number(id));
  if (!deleted) {
    return mockFailure({ code: "not_found", message: `${storeName} not found` });
  }
  return mockSuccess(undefined);
}

// ── Sorting ──

function applySorting(rows: Record<string, unknown>[], sortStr: string): Record<string, unknown>[] {
  const sortParts = sortStr.split(",").map((s) => {
    const [field, dir] = s.trim().split(":");
    return { field, desc: dir === "desc" };
  });

  return [...rows].sort((a, b) => {
    for (const { field, desc } of sortParts) {
      const aVal = a[field];
      const bVal = b[field];
      let cmp = 0;

      if (aVal == null && bVal == null) cmp = 0;
      else if (aVal == null) cmp = -1;
      else if (bVal == null) cmp = 1;
      else if (typeof aVal === "number" && typeof bVal === "number") cmp = aVal - bVal;
      else cmp = String(aVal).localeCompare(String(bVal));

      if (cmp !== 0) return desc ? -cmp : cmp;
    }
    return 0;
  });
}

// ── Response Helper ──

function toResponse<T>(result: MockResult<T>, successStatus = 200) {
  if (result.success) {
    if (successStatus === 204) {
      return new HttpResponse(null, { status: 204 });
    }
    return HttpResponse.json({ data: result.data }, { status: successStatus });
  }

  const status =
    result.error?.code === "not_found"
      ? 404
      : result.error?.code === "unique_violation"
        ? 409
        : result.error?.code === "foreign_key_violation"
          ? 422
          : 500;

  return HttpResponse.json(
    { code: result.error?.code, message: result.error?.message },
    { status },
  );
}
