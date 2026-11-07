import { type Query, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

/**
 * Whether a query reads under an API prefix: its first key element is a string starting with it.
 *
 * Generated query keys lead with the route (`['/api/v1/company/4']`, `['/api/v1/company/search',
 * params]`), so a prefix is every read of one entity.
 *
 * @param apiPrefix - The entity's base path, such as a generated `<entity>EntityPath`.
 * @returns A predicate for `invalidateQueries`.
 */
export function readsUnder(apiPrefix: string): (query: Query) => boolean {
  return (query) => typeof query.queryKey[0] === "string" && query.queryKey[0].startsWith(apiPrefix);
}

/**
 * Returns a stable callback that invalidates all queries whose first key
 * element starts with the given URL prefix.
 *
 * Returns a Promise that resolves when all matching queries have been
 * refetched. Callers that need to sequence state resets after invalidation
 * (e.g. clearing draft state in inline editors) should `await` the result.
 * Fire-and-forget callers (e.g. `onSettled: invalidate`) are unaffected
 * by the return type change.
 *
 * Works with Orval-generated query keys like:
 * - `['/api/v1/company/4']` (detail)
 * - `['/api/v1/company/search', params]` (list)
 *
 * A Meta-generated domain exports each entity's prefix as `<entity>EntityPath`; pass that rather
 * than typing the route.
 */
export function useInvalidateEntity(apiPrefix: string): () => Promise<void> {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ predicate: readsUnder(apiPrefix) }),
    [queryClient, apiPrefix],
  );
}
