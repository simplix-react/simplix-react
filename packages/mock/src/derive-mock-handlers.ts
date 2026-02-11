import { HttpResponse, http } from "msw";
import type { ApiContractConfig, EntityDefinition, OperationDefinition } from "@simplix-react/contract";
import type { z } from "zod";
import { getPGliteInstance } from "./pglite.js";
import { mapRows, mapRow, toSnakeCase } from "./sql/row-mapping.js";
import { buildSetClause } from "./sql/query-building.js";
import { mapPgError } from "./sql/error-mapping.js";
import { mockSuccess, mockFailure, type MockResult } from "./mock-result.js";

type AnyEntityDef = EntityDefinition<z.ZodTypeAny, z.ZodTypeAny, z.ZodTypeAny>;
type AnyOperationDef = OperationDefinition<z.ZodTypeAny, z.ZodTypeAny>;

/**
 * Provides per-entity configuration for mock handler generation.
 *
 * Allows overriding the default table name, pagination limits, sort order,
 * and relation loading for a specific entity when calling {@link deriveMockHandlers}.
 *
 * @example
 * ```ts
 * import type { MockEntityConfig } from "@simplix-react/mock";
 *
 * const taskConfig: MockEntityConfig = {
 *   tableName: "tasks",
 *   defaultLimit: 20,
 *   maxLimit: 100,
 *   defaultSort: "created_at DESC",
 *   relations: {
 *     project: {
 *       table: "projects",
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
  /** Overrides the auto-derived PostgreSQL table name. */
  tableName?: string;
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
   * Default SQL ORDER BY clause.
   *
   * @defaultValue `"created_at DESC"`
   */
  defaultSort?: string;
  /** Map of relation names to their `belongsTo` join configuration. */
  relations?: Record<string, {
    table: string;
    localKey: string;
    foreignKey?: string;
    type: "belongsTo";
  }>;
}

/**
 * Derives MSW request handlers from an {@link @simplix-react/contract!ApiContractConfig}.
 *
 * Generates a complete set of CRUD handlers for every entity defined in the contract:
 *
 * - **GET list** — supports query-param filtering, sorting, and offset-based pagination
 * - **GET by id** — supports `belongsTo` relation loading via joins
 * - **POST create** — auto-generates a UUID `id` when not provided
 * - **PATCH update** — partial updates with automatic `updated_at` timestamp
 * - **DELETE** — removes the row by `id`
 *
 * All handlers read from and write to the PGlite singleton managed by
 * {@link initPGlite}/{@link getPGliteInstance}.
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
 * import { projectContract } from "./contract";
 *
 * const handlers = deriveMockHandlers(projectContract.config, {
 *   task: {
 *     tableName: "tasks",
 *     defaultLimit: 20,
 *     relations: {
 *       project: {
 *         table: "projects",
 *         localKey: "projectId",
 *         type: "belongsTo",
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * @see {@link MockEntityConfig} - Per-entity configuration options.
 * @see {@link setupMockWorker} - High-level bootstrap that accepts these handlers.
 * @see {@link @simplix-react/contract!ApiContractConfig} - The contract config shape.
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
    const tableName = entityConfig?.tableName ?? toSnakeCase(name) + "s";
    const defaultLimit = entityConfig?.defaultLimit ?? 50;
    const maxLimit = entityConfig?.maxLimit ?? 100;
    const defaultSort = entityConfig?.defaultSort ?? "created_at DESC";
    const relations = entityConfig?.relations;

    // GET list
    if (entity.parent) {
      const listPath = `${basePath}${entity.parent.path}/:${entity.parent.param}${entity.path}`;
      handlers.push(
        http.get(listPath, async ({ request, params: routeParams }) => {
          const parentId = routeParams[entity.parent!.param] as string;
          const parentColumn = toSnakeCase(entity.parent!.param);
          const searchParams = parseSearchParams(request.url);
          return toResponse(
            await queryListWithParams(
              tableName, parentColumn, parentId,
              searchParams, defaultLimit, maxLimit, defaultSort,
            ),
          );
        }),
      );
    } else {
      handlers.push(
        http.get(`${basePath}${entity.path}`, async ({ request }) => {
          const searchParams = parseSearchParams(request.url);
          return toResponse(
            await queryListWithParams(
              tableName, undefined, undefined,
              searchParams, defaultLimit, maxLimit, defaultSort,
            ),
          );
        }),
      );
    }

    // GET by id (with optional relation loading)
    handlers.push(
      http.get(`${basePath}${entity.path}/:id`, async ({ params: routeParams }) => {
        const id = routeParams.id as string;
        if (relations) {
          return toResponse(await queryByIdWithRelations(tableName, id, relations));
        }
        return toResponse(await queryById(tableName, id));
      }),
    );

    // POST create
    if (entity.parent) {
      const createPath = `${basePath}${entity.parent.path}/:${entity.parent.param}${entity.path}`;
      handlers.push(
        http.post(createPath, async ({ request, params: routeParams }) => {
          const dto = (await request.json()) as Record<string, unknown>;
          const parentId = routeParams[entity.parent!.param] as string;
          dto[entity.parent!.param] = parentId;
          return toResponse(await insertRow(tableName, dto), 201);
        }),
      );
    } else {
      handlers.push(
        http.post(`${basePath}${entity.path}`, async ({ request }) => {
          const dto = (await request.json()) as Record<string, unknown>;
          return toResponse(await insertRow(tableName, dto), 201);
        }),
      );
    }

    // PATCH update
    handlers.push(
      http.patch(`${basePath}${entity.path}/:id`, async ({ request, params: routeParams }) => {
        const id = routeParams.id as string;
        const dto = (await request.json()) as Record<string, unknown>;
        return toResponse(await updateRow(tableName, id, dto));
      }),
    );

    // DELETE
    handlers.push(
      http.delete(`${basePath}${entity.path}/:id`, async ({ params: routeParams }) => {
        const id = routeParams.id as string;
        return toResponse(await deleteRow(tableName, id));
      }),
    );
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

// ── SQL Helpers ──

async function queryListWithParams<T>(
  tableName: string,
  parentColumn: string | undefined,
  parentId: string | undefined,
  searchParams: ParsedSearchParams,
  defaultLimit: number,
  maxLimit: number,
  defaultSort: string,
): Promise<MockResult<{ data: T[]; meta?: { total: number; page: number; limit: number; hasNextPage: boolean } }>> {
  try {
    const db = getPGliteInstance();
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    // Parent filter
    if (parentColumn && parentId) {
      conditions.push(`${parentColumn} = $${paramIndex}`);
      values.push(parentId);
      paramIndex++;
    }

    // Dynamic filters from query params
    for (const [key, value] of Object.entries(searchParams.filters)) {
      const column = toSnakeCase(key);
      conditions.push(`${column} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Sort
    let orderClause = `ORDER BY ${defaultSort}`;
    if (searchParams.sort) {
      const sortParts = searchParams.sort.split(",").map((s) => {
        const [field, dir] = s.trim().split(":");
        const column = toSnakeCase(field);
        const direction = dir === "desc" ? "DESC" : "ASC";
        return `${column} ${direction}`;
      });
      orderClause = `ORDER BY ${sortParts.join(", ")}`;
    }

    // Pagination
    const hasPagination = searchParams.page !== undefined || searchParams.cursor !== undefined;
    const limit = Math.min(searchParams.limit ?? defaultLimit, maxLimit);

    if (hasPagination) {
      // Count total
      const countSql = `SELECT COUNT(*) as count FROM ${tableName} ${whereClause}`;
      const countResult = await db.query(countSql, values);
      const total = parseInt(String((countResult.rows[0] as Record<string, unknown>).count), 10);

      // Offset-based pagination
      const page = searchParams.page ?? 1;
      const offset = (page - 1) * limit;

      const dataSql = `SELECT * FROM ${tableName} ${whereClause} ${orderClause} LIMIT ${limit} OFFSET ${offset}`;
      const dataResult = await db.query(dataSql, values);
      const rows = mapRows<T>(dataResult.rows as Record<string, unknown>[]);

      return mockSuccess({
        data: rows,
        meta: {
          total,
          page,
          limit,
          hasNextPage: offset + rows.length < total,
        },
      });
    }

    // No pagination: return all rows
    const sql = `SELECT * FROM ${tableName} ${whereClause} ${orderClause}`;
    const result = await db.query(sql, values);
    return mockSuccess({ data: mapRows<T>(result.rows as Record<string, unknown>[]) });
  } catch (err) {
    const mapped = mapPgError(err);
    return mockFailure({ code: mapped.code, message: mapped.message });
  }
}

async function queryById<T>(tableName: string, id: string): Promise<MockResult<T>> {
  try {
    const db = getPGliteInstance();
    const result = await db.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return mockFailure({ code: "not_found", message: `${tableName} not found` });
    }
    return mockSuccess(mapRow<T>(result.rows[0] as Record<string, unknown>));
  } catch (err) {
    const mapped = mapPgError(err);
    return mockFailure({ code: mapped.code, message: mapped.message });
  }
}

async function queryByIdWithRelations<T>(
  tableName: string,
  id: string,
  relations: Record<string, { table: string; localKey: string; foreignKey?: string; type: "belongsTo" }>,
): Promise<MockResult<T>> {
  try {
    const db = getPGliteInstance();
    const mainResult = await db.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
    if (mainResult.rows.length === 0) {
      return mockFailure({ code: "not_found", message: `${tableName} not found` });
    }

    const row = mainResult.rows[0] as Record<string, unknown>;
    const mapped = mapRow<Record<string, unknown>>(row);

    // Load belongsTo relations
    for (const [relationName, relation] of Object.entries(relations)) {
      const localColumn = toSnakeCase(relation.localKey);
      const fkValue = row[localColumn];
      if (fkValue) {
        const foreignKey = relation.foreignKey ?? "id";
        const relResult = await db.query(
          `SELECT * FROM ${relation.table} WHERE ${foreignKey} = $1`,
          [fkValue],
        );
        if (relResult.rows.length > 0) {
          mapped[relationName] = mapRow(relResult.rows[0] as Record<string, unknown>);
        }
      }
    }

    return mockSuccess(mapped as T);
  } catch (err) {
    const mapped = mapPgError(err);
    return mockFailure({ code: mapped.code, message: mapped.message });
  }
}

async function insertRow<T>(
  tableName: string,
  dto: Record<string, unknown>,
): Promise<MockResult<T>> {
  try {
    const db = getPGliteInstance();
    const columns: string[] = [];
    const placeholders: string[] = [];
    const values: unknown[] = [];
    let index = 1;

    // Always include an id if not provided
    if (!dto.id) {
      columns.push("id");
      placeholders.push(`$${index}`);
      values.push(crypto.randomUUID());
      index++;
    }

    for (const [key, value] of Object.entries(dto)) {
      if (value === undefined) continue;
      const column = toSnakeCase(key);
      columns.push(column);

      if (typeof value === "object" && value !== null && !(value instanceof Date)) {
        placeholders.push(`$${index}::jsonb`);
        values.push(JSON.stringify(value));
      } else {
        placeholders.push(`$${index}`);
        values.push(value);
      }
      index++;
    }

    const sql = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
    const result = await db.query(sql, values);
    return mockSuccess(mapRow<T>(result.rows[0] as Record<string, unknown>));
  } catch (err) {
    const mapped = mapPgError(err);
    return mockFailure({ code: mapped.code, message: mapped.message });
  }
}

async function updateRow<T>(
  tableName: string,
  id: string,
  dto: Record<string, unknown>,
): Promise<MockResult<T>> {
  try {
    const db = getPGliteInstance();
    const { clause, values, nextIndex } = buildSetClause(dto);

    if (values.length === 0) {
      // Only updated_at
      const result = await db.query(
        `UPDATE ${tableName} SET updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id],
      );
      if (result.rows.length === 0) {
        return mockFailure({ code: "not_found", message: `${tableName} not found` });
      }
      return mockSuccess(mapRow<T>(result.rows[0] as Record<string, unknown>));
    }

    const sql = `UPDATE ${tableName} SET ${clause} WHERE id = $${nextIndex} RETURNING *`;
    const result = await db.query(sql, [...values, id]);

    if (result.rows.length === 0) {
      return mockFailure({ code: "not_found", message: `${tableName} not found` });
    }
    return mockSuccess(mapRow<T>(result.rows[0] as Record<string, unknown>));
  } catch (err) {
    const mapped = mapPgError(err);
    return mockFailure({ code: mapped.code, message: mapped.message });
  }
}

async function deleteRow(tableName: string, id: string): Promise<MockResult<void>> {
  try {
    const db = getPGliteInstance();
    const result = await db.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
    if (result.affectedRows === 0) {
      return mockFailure({ code: "not_found", message: `${tableName} not found` });
    }
    return mockSuccess(undefined);
  } catch (err) {
    const mapped = mapPgError(err);
    return mockFailure({ code: mapped.code, message: mapped.message });
  }
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
