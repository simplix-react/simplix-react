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

/** Reason for an empty list state (no data, no filter match, no search match, or error). */
export type EmptyReason = "no-data" | "no-filter" | "no-search" | "error";
