// Minimal hook shape to avoid tight coupling with @simplix-react/react generics
/**
 * Minimal return shape for list data hooks passed to a list state machine
 * (the web `useCrudList` page model or the native `useEntityFeed` feed model).
 *
 * @typeParam T - Row data type.
 */
export interface ListHookResult<T> {
  /** Array of row items, or `undefined` while loading. */
  data: T[] | undefined;
  /** Total number of items (for server-side pagination). */
  total?: number;
  /** Whether the query is currently loading. */
  isLoading: boolean;
  /** Error object if the query failed, otherwise `null`. */
  error: Error | null;
  /**
   * Whether the query is in flight but stalled — React Query's
   * `fetchStatus === "paused"`. A paused query reports `isLoading: false` and
   * `error: null`, so without this flag a stalled fetch is indistinguishable
   * from a successful empty result.
   *
   * @remarks
   * Optional so that existing producers of this shape keep compiling; omit it
   * and the list falls back to the settled-only interpretation.
   */
  isPaused?: boolean;
  /**
   * Number of consecutive failed fetch attempts — React Query's
   * `failureCount`. A value greater than `0` while `error` is still `null`
   * means an attempt failed and a retry is pending, which is a non-success
   * state rather than an empty result.
   */
  failureCount?: number;
}

/**
 * Hook signature for list data fetching, compatible with Orval-generated query hooks.
 *
 * @typeParam T - Row data type.
 */
export interface ListHook<T> {
  (params?: Record<string, unknown>, options?: Record<string, unknown>): ListHookResult<T>;
}
