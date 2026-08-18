import type { ReactNode } from "react";

import { DetailList } from "../../base/display/detail-list-row";
import { CrudList } from "../list/crud-list";

/** Props for the {@link DetailPagedList} sub-component. */
export interface CrudDetailListProps {
  /** `DetailListRow` elements for the page currently shown. */
  children: ReactNode;
  /** The page being shown, 1-based. */
  page: number;
  /** How many rows a page holds. */
  pageSize: number;
  /** How many rows there are in total, across every page. */
  total: number;
  /**
   * How many pages that comes to.
   *
   * <p>Taken rather than derived, because the server that counted the rows is the one that
   * decided how they divide — a client dividing `total` by `pageSize` disagrees with it the
   * moment the endpoint caps a page or filters after counting.
   */
  totalPages: number;
  /** Called with the page the reader asked for. */
  onPageChange: (page: number) => void;
  /** Additional classes merged onto the container root. */
  className?: string;
}

/**
 * A sub-list inside a detail panel: bordered rows with the list's own pager docked under them.
 *
 * <p><b>A sub-list is a real list.</b> The rows under a panel's tab — the accounts holding a role,
 * the grants on a scope, the people in a rank — are the same kind of thing as the rows on a list
 * screen, and a reader who can page through them there expects to page through them here. What
 * happens without this is not that the rows are missing: it is that each screen invents its own
 * way of saying there are more of them. Six panels in one console arrived at six — 「그 외 4명」,
 * a truncated ten with no note at all, a 「전체 보기」 that navigated away and lost the panel.
 *
 * <p><b>It is the list's pager, not another one.</b> `CrudList.Pagination` reads its own container
 * width and goes compact below 640px, which is every detail panel — so the control that fills a
 * list screen's footer fits a 520px panel without a second component existing to be styled
 * differently later.
 *
 * <p><b>The pager renders only when there is more than one page.</b> A single page of four rows
 * with a pager under it reads as a list that failed to load the rest.
 *
 * @example
 * ```tsx
 * <CrudDetail.List
 *   page={holders.page}
 *   pageSize={holders.pageSize}
 *   total={holders.total}
 *   totalPages={holders.totalPages}
 *   onPageChange={holders.setPage}
 * >
 *   {holders.rows.map((row) => (
 *     <DetailListRow key={row.userId} primary={row.name} trailing={row.username} />
 *   ))}
 * </CrudDetail.List>
 * ```
 */
export function DetailPagedList({
  children,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  className,
}: CrudDetailListProps) {
  return (
    <DetailList
      className={className}
      footer={
        totalPages > 1 ? (
          <CrudList.Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        ) : undefined
      }
    >
      {children}
    </DetailList>
  );
}
