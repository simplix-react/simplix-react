import { useQueries, type QueryFunction } from "@tanstack/react-query";
import { useMemo } from "react";

/**
 * Fetches detail records for every item in a list query, using `useQueries` + `combine`.
 *
 * Extracts IDs from each list item via `extractId`, builds one query per ID,
 * and returns the combined results. Skips items whose `extractId` returns `undefined`.
 *
 * @typeParam TList - The list item type (e.g. a summary row).
 * @typeParam TDetail - The detail type fetched per ID.
 *
 * @param listData - Array of list items (or `undefined` while the list is loading).
 * @param extractId - Function to pull a string ID from each list item.
 * @param getQueryOptions - Factory that returns `{ queryKey, queryFn }` for a given ID.
 *
 * @returns `{ data, isPending }` — `data` contains successfully resolved details;
 *   `isPending` is `true` while any detail query is still in flight.
 *
 * @example
 * ```ts
 * const { data: details, isPending } = useBatchDetails(
 *   scuList,
 *   (scu) => scu.id,
 *   (id) => ({
 *     queryKey: scuKeys.detail(id),
 *     queryFn: () => fetchScuDetail(id),
 *   }),
 * );
 * ```
 */
export function useBatchDetails<TList, TDetail>(
  listData: TList[] | undefined,
  extractId: (item: TList) => string | undefined,
  getQueryOptions: (id: string) => {
    queryKey: readonly unknown[];
    queryFn: QueryFunction<TDetail>;
  },
): { data: TDetail[]; isPending: boolean } {
  const ids = useMemo(() => {
    if (!listData) return [];
    const result: string[] = [];
    for (const item of listData) {
      const id = extractId(item);
      if (id !== undefined) result.push(id);
    }
    return result;
  }, [listData, extractId]);

  return useQueries({
    queries: ids.map((id) => ({
      ...getQueryOptions(id),
      enabled: true,
    })),
    combine: (results) => ({
      data: results
        .filter((r) => r.isSuccess)
        .map((r) => r.data),
      isPending: results.some((r) => r.isPending),
    }),
  });
}
