// ── Query Parameter Types ──

/**
 * Describes a single sort directive with field name and direction.
 *
 * @example
 * ```ts
 * import type { SortParam } from "@simplix-react/contract";
 *
 * const sort: SortParam = { field: "createdAt", direction: "desc" };
 * ```
 */
export interface SortParam {
  /** The field name to sort by. */
  field: string;
  /** Sort direction: ascending or descending. */
  direction: "asc" | "desc";
}

/**
 * Describes pagination strategy, supporting both offset-based and cursor-based patterns.
 *
 * @example
 * ```ts
 * import type { PaginationParam } from "@simplix-react/contract";
 *
 * // Offset-based
 * const offset: PaginationParam = { type: "offset", page: 1, limit: 20 };
 *
 * // Cursor-based
 * const cursor: PaginationParam = { type: "cursor", cursor: "abc123", limit: 20 };
 * ```
 */
export type PaginationParam =
  | { type: "offset"; page: number; limit: number }
  | { type: "cursor"; cursor: string; limit: number };

/**
 * Encapsulates all list query parameters: filters, sorting, and pagination.
 *
 * Passed to entity `list()` methods and serialized into URL search params
 * by a {@link QueryBuilder}.
 *
 * @typeParam TFilters - Shape of the filter object, defaults to `Record<string, unknown>`.
 *
 * @example
 * ```ts
 * import type { ListParams } from "@simplix-react/contract";
 *
 * const params: ListParams = {
 *   filters: { status: "active" },
 *   sort: { field: "title", direction: "asc" },
 *   pagination: { type: "offset", page: 1, limit: 10 },
 * };
 *
 * await api.client.task.list(params);
 * ```
 */
export interface ListParams<TFilters = Record<string, unknown>> {
  /** Optional filter criteria applied to the list query. */
  filters?: TFilters;
  /** Single sort directive or array of sort directives. */
  sort?: SortParam | SortParam[];
  /** Pagination strategy and parameters. */
  pagination?: PaginationParam;
}

/**
 * Describes pagination metadata returned from the server.
 *
 * Used by {@link QueryBuilder.parsePageInfo} to extract pagination state
 * from API responses, enabling infinite scroll and paginated UIs.
 *
 * @example
 * ```ts
 * import type { PageInfo } from "@simplix-react/contract";
 *
 * const pageInfo: PageInfo = {
 *   total: 42,
 *   hasNextPage: true,
 *   nextCursor: "cursor-xyz",
 * };
 * ```
 */
export interface PageInfo {
  /** Total number of items across all pages (if the server provides it). */
  total?: number;
  /** Whether more items exist beyond the current page. */
  hasNextPage: boolean;
  /** Cursor value to fetch the next page (cursor-based pagination only). */
  nextCursor?: string;
}

/**
 * Defines how list parameters are serialized to URL search params and how
 * pagination metadata is extracted from API responses.
 *
 * Implement this interface to adapt the framework to your API's query string
 * conventions. Use {@link simpleQueryBuilder} as a ready-made implementation
 * for common REST patterns.
 *
 * @example
 * ```ts
 * import type { QueryBuilder } from "@simplix-react/contract";
 *
 * const customQueryBuilder: QueryBuilder = {
 *   buildSearchParams(params) {
 *     const sp = new URLSearchParams();
 *     if (params.pagination?.type === "offset") {
 *       sp.set("offset", String((params.pagination.page - 1) * params.pagination.limit));
 *       sp.set("limit", String(params.pagination.limit));
 *     }
 *     return sp;
 *   },
 *   parsePageInfo(response) {
 *     const { total, nextCursor } = response as any;
 *     return { total, hasNextPage: !!nextCursor, nextCursor };
 *   },
 * };
 * ```
 *
 * @see {@link simpleQueryBuilder} for the built-in implementation.
 */
export interface QueryBuilder {
  /** Converts structured list parameters into URL search params. */
  buildSearchParams(params: ListParams): URLSearchParams;
  /** Extracts pagination metadata from an API response (optional). */
  parsePageInfo?(response: unknown): PageInfo;
}
