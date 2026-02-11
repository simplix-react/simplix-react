import type { QueryClient } from "@tanstack/react-query";

/**
 * Polls the {@link QueryClient} until the given query key resolves to a
 * non-pending status.
 *
 * @remarks
 * Useful when a test needs to wait for server state to settle before making
 * assertions, without relying on UI-level utilities such as `waitFor` from
 * `@testing-library/react`.
 *
 * The function polls every 10 ms and rejects with an error if the query has
 * not resolved within the specified timeout.
 *
 * @param queryClient - The {@link QueryClient} instance that owns the query cache.
 * @param queryKey - The query key to observe.
 * @param options - Optional configuration.
 * @param options.timeout - Maximum time (ms) to wait before throwing. Defaults to `5000`.
 * @returns A promise that resolves when the query is no longer in `"pending"` status.
 * @throws If the query does not resolve within the timeout period.
 *
 * @example
 * ```ts
 * import { createTestQueryClient, waitForQuery } from "@simplix-react/testing";
 *
 * const queryClient = createTestQueryClient();
 *
 * // ... trigger a query fetch ...
 *
 * await waitForQuery(queryClient, ["users"]);
 * const data = queryClient.getQueryData(["users"]);
 * expect(data).toBeDefined();
 * ```
 */
export async function waitForQuery(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  options?: { timeout?: number },
): Promise<void> {
  const timeout = options?.timeout ?? 5000;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const state = queryClient.getQueryState(queryKey);
    if (state && state.status !== "pending") return;
    await new Promise((r) => setTimeout(r, 10));
  }

  throw new Error(`Query ${JSON.stringify(queryKey)} did not resolve within ${timeout}ms`);
}
