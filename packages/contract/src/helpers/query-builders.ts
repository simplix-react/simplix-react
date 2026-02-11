import type { QueryBuilder } from "./query-types.js";

/**
 * Provides a straightforward {@link QueryBuilder} implementation for common REST APIs.
 *
 * Serializes filters as flat key-value pairs, sort as `field:direction` comma-separated
 * values, and pagination as `page`/`limit` (offset) or `cursor`/`limit` (cursor-based).
 *
 * @example
 * ```ts
 * import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";
 *
 * const api = defineApi({
 *   domain: "project",
 *   basePath: "/api/v1",
 *   entities: { task: taskEntity },
 *   queryBuilder: simpleQueryBuilder,
 * });
 *
 * // Produces: /api/v1/tasks?status=pending&sort=name:asc&page=1&limit=10
 * await api.client.task.list({
 *   filters: { status: "pending" },
 *   sort: { field: "name", direction: "asc" },
 *   pagination: { type: "offset", page: 1, limit: 10 },
 * });
 * ```
 *
 * @see {@link QueryBuilder} for implementing custom serialization strategies.
 */
export const simpleQueryBuilder: QueryBuilder = {
  buildSearchParams(params) {
    const sp = new URLSearchParams();

    if (params.filters) {
      for (const [k, v] of Object.entries(params.filters)) {
        if (v !== undefined && v !== null) sp.set(k, String(v));
      }
    }

    if (params.sort) {
      const sorts = Array.isArray(params.sort) ? params.sort : [params.sort];
      sp.set(
        "sort",
        sorts.map((s) => `${s.field}:${s.direction}`).join(","),
      );
    }

    if (params.pagination) {
      if (params.pagination.type === "offset") {
        sp.set("page", String(params.pagination.page));
        sp.set("limit", String(params.pagination.limit));
      } else {
        sp.set("cursor", params.pagination.cursor);
        sp.set("limit", String(params.pagination.limit));
      }
    }

    return sp;
  },
};
