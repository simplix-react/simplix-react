// ── Sort / Filter / Pagination types ──

/** Represents a sort configuration with field name and direction. */
export interface SortState {
  field: string;
  direction: "asc" | "desc";
}

/** Represents pagination state with page, size, and total count. */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

/** Represents filter state with search text and key-value filters. */
export interface FilterState {
  search: string;
  values: Record<string, unknown>;
}

/**
 * Reason a list renders no rows.
 *
 * @remarks
 * Three of the four reasons describe a query that settled successfully with an
 * empty result (`"no-data"`, `"no-filter"`, `"no-search"`). The remaining two
 * describe a query that never produced a result:
 *
 * - `"error"` — the query settled with a rejection.
 * - `"unavailable"` — the query is neither settled nor progressing: it is
 *   paused (React Query `fetchStatus === "paused"`) or waiting to retry after a
 *   failed attempt. No error is exposed yet because the retries are not
 *   exhausted, so this state must never be reported as absence of data.
 */
export type EmptyReason = "no-data" | "no-filter" | "no-search" | "error" | "unavailable";
