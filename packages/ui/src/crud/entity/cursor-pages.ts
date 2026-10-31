import { useInfiniteQuery } from "@tanstack/react-query";

/** Options for {@link useCursorPages}. */
export interface CursorPagesOptions<R, T> {
  /**
   * The query key of the read, without the cursor: the generated `get…QueryKey(params)` with the
   * cursor left out, so every page of one read shares a key and a change of the other parameters
   * starts again from the first page.
   */
  readonly queryKey: readonly unknown[];
  /** Reads one page: the generated fetcher called with the cursor the previous page returned. */
  readonly fetchPage: (cursor: string | undefined, signal: AbortSignal) => Promise<R>;
  /** The rows one page carries. */
  readonly items: (page: R) => readonly T[] | null | undefined;
  /** The cursor that reads the page after this one; empty when this page is the last. */
  readonly next: (page: R) => string | null | undefined;
  /** Holds the read back, as a query's `enabled` does. */
  readonly enabled?: boolean;
}

/** What {@link useCursorPages} returns. */
export interface CursorPages<T> {
  /** Every row read so far, in the order the pages arrived. */
  readonly items: readonly T[];
  /** True while the first page is being read. */
  readonly isLoading: boolean;
  /** True when the last read failed. */
  readonly isError: boolean;
  /** True when the server named a page after the last one read. */
  readonly hasMore: boolean;
  /** True while the next page is being read. */
  readonly isLoadingMore: boolean;
  /** Reads the next page; does nothing when there is none or one is already being read. */
  readonly loadMore: () => void;
}

/**
 * A keyset-paged read, page after page, for a generated read that answers with a cursor rather
 * than a page number and a total.
 *
 * <p><b>Why not `useCrudList`.</b> The list state machine addresses a page by its index and draws a
 * pager from the total, and a keyset read has neither: the server answers with rows and the cursor
 * of the next page, and the only way to page 3 is through page 2. Handing such a read to a pager
 * draws page numbers that address nothing. The shape that fits is the one the read has, a list
 * that grows by a 「more」 control, and that is what this returns.
 *
 * <p><b>The cursor stays out of the key.</b> Every page of one read is one infinite query, so a
 * refetch after a write re-reads the pages already shown in order instead of keeping stale ones
 * beside a fresh first page.
 *
 * @typeParam R the page type the read answers with
 * @typeParam T the row type
 * @param options the read, how to take rows and the next cursor out of a page
 * @returns the rows read so far and the control that reads the next page
 */
export function useCursorPages<R, T>(options: CursorPagesOptions<R, T>): CursorPages<T> {
  const query = useInfiniteQuery({
    queryKey: [...options.queryKey, "cursor-pages"],
    queryFn: ({ pageParam, signal }) => options.fetchPage(pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: R) => options.next(last) || undefined,
    enabled: options.enabled ?? true,
  });
  const items = (query.data?.pages ?? []).flatMap((page) => [...(options.items(page) ?? [])]);
  return {
    items,
    isLoading: query.isLoading,
    isError: query.isError,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
    },
  };
}
