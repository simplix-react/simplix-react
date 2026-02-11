import { QueryClient } from "@tanstack/react-query";

/**
 * Creates a {@link QueryClient} pre-configured for deterministic test execution.
 *
 * @remarks
 * The returned client disables retries, garbage-collection time, and stale time
 * so that queries resolve immediately and do not leak state between tests.
 *
 * Default options applied:
 *
 * - `queries.retry` → `false`
 * - `queries.gcTime` → `0`
 * - `queries.staleTime` → `0`
 * - `mutations.retry` → `false`
 *
 * @returns A {@link QueryClient} instance with test-optimized defaults.
 *
 * @example
 * ```ts
 * import { createTestQueryClient } from "@simplix-react/testing";
 *
 * const queryClient = createTestQueryClient();
 *
 * afterEach(() => {
 *   queryClient.clear();
 * });
 * ```
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
