import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

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
 */
export function useInvalidateEntity(apiPrefix: string): () => Promise<void> {
  const queryClient = useQueryClient();
  return useCallback(
    () => {
      return queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].startsWith(apiPrefix),
      });
    },
    [queryClient, apiPrefix],
  );
}
