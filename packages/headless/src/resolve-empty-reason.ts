import type { EmptyReason } from "./shared-types";

/** Query and filter state a list view derives its {@link EmptyReason} from. */
export interface ResolveEmptyReasonInput {
  /** Whether the view currently renders at least one row. */
  hasRows: boolean;
  /** Whether the query is loading (React Query `isLoading`). */
  isLoading: boolean;
  /** Settled rejection, if any. */
  error: unknown;
  /** Whether the query is stalled — React Query `fetchStatus === "paused"`. */
  isPaused?: boolean;
  /** Consecutive failed fetch attempts — React Query `failureCount`. */
  failureCount?: number;
  /** Whether a search term is active. */
  hasSearch?: boolean;
  /** Whether at least one filter is committed. */
  hasFilters?: boolean;
}

/**
 * Classify why a list renders no rows.
 *
 * @remarks
 * The order of the checks is the contract: a query that is not settled
 * successfully is reported as such (`"error"` or `"unavailable"`) before any
 * "empty result" reason is considered. React Query pauses a fetch whenever the
 * document is hidden or the browser reports offline, and a paused query looks
 * exactly like a successful empty one — `isLoading: false`, `error: null` — so
 * `isPaused` / `failureCount` are what keep a rejected or stalled query from
 * being rendered to the user as "no data".
 *
 * @param input - Query and filter state of the list view.
 * @returns The empty reason, or `null` when rows are present or the first load
 *   is still in flight.
 *
 * @example
 * ```ts
 * const reason = resolveEmptyReason({
 *   hasRows: rows.length > 0,
 *   isLoading: query.isLoading,
 *   error: query.error,
 *   isPaused: query.isPaused,
 *   failureCount: query.failureCount,
 *   hasSearch: search !== "",
 *   hasFilters: activeFilterCount > 0,
 * });
 * ```
 */
export function resolveEmptyReason(input: ResolveEmptyReasonInput): EmptyReason | null {
  if (input.hasRows) return null;
  if (input.isLoading) return null;
  if (input.error) return "error";
  if (input.isPaused === true) return "unavailable";
  if ((input.failureCount ?? 0) > 0) return "unavailable";
  if (input.hasSearch) return "no-search";
  if (input.hasFilters) return "no-filter";
  return "no-data";
}
