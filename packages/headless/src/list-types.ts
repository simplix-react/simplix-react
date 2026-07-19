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
}

/**
 * Hook signature for list data fetching, compatible with Orval-generated query hooks.
 *
 * @typeParam T - Row data type.
 */
export interface ListHook<T> {
  (params?: Record<string, unknown>, options?: Record<string, unknown>): ListHookResult<T>;
}
