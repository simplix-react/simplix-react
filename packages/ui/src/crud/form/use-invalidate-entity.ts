import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

/**
 * Returns a stable callback that invalidates all queries whose first key
 * element starts with the given URL prefix.
 *
 * Invalidation is deferred to the next macrotask so that React can process
 * navigation state updates first. This prevents refetching queries for
 * components that are about to unmount (e.g. edit forms with gcTime: 0).
 *
 * Works with Orval-generated query keys like:
 * - `['/api/v1/company/4']` (detail)
 * - `['/api/v1/company/search', params]` (list)
 */
export function useInvalidateEntity(apiPrefix: string): () => void {
  const queryClient = useQueryClient();
  return useCallback(
    () => {
      setTimeout(() => {
        queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === "string" &&
            query.queryKey[0].startsWith(apiPrefix),
        });
      }, 0);
    },
    [queryClient, apiPrefix],
  );
}
