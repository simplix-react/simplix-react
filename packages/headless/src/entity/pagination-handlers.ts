/**
 * The pagination state a list controller publishes, as far as this helper reads it.
 *
 * <p>Structural rather than the framework's own type so the helper can be handed the pagination
 * of any list controller, including one a screen assembled itself.
 */
interface PaginationLike {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly totalPages: number;
  readonly setPage: (page: number) => void;
  readonly setPageSize: (size: number) => void;
}

/** What a list hands `CrudList.Pagination`. */
export interface PaginationHandlers {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly totalPages: number;
  readonly onPageChange: (page: number) => void;
  readonly onPageSizeChange: (size: number) => void;
}

/**
 * The pagination props for a list, with the page reset when the page size grows.
 *
 * <p><b>The framework's `setPageSize` is a bare state setter and leaves the page index where it
 * was.</b> A reader on page 2 of twenty rows who asks for fifty per page is then asking for the
 * second page of a one-page list, and the server answers with nothing — so enlarging the page
 * empties the screen, and the empty state says the calendar holds no days. Nothing errors, and the
 * reader's next move is usually to reload rather than to page back.
 *
 * <p>Resetting on any size change rather than only on a growth: shrinking the page keeps the row
 * the reader was looking at on screen only by accident, and landing on the first page is the one
 * outcome that is never surprising.
 *
 * <p><b>The first page is 1, not 0.</b> `useCrudList` holds a one-based page and sends
 * `page - 1` on the wire, so a reset to 0 asks the server for page −1 — which answers with
 * nothing and empties the very screen this helper exists to keep full. The off-by-one is silent:
 * it looks like the reset the helper promises, and only the request says otherwise.
 *
 * @param pagination the list controller's pagination state
 * @returns the props to spread onto the pagination control
 */
export function paginationHandlers(pagination: PaginationLike): PaginationHandlers {
  return {
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: pagination.total,
    totalPages: pagination.totalPages,
    onPageChange: pagination.setPage,
    onPageSizeChange: (size) => {
      pagination.setPageSize(size);
      pagination.setPage(1);
    },
  };
}
