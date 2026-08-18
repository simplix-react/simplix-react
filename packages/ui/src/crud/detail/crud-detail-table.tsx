import type { ReactNode } from "react";

import { CrudList } from "../list/crud-list";
import { TableCardFrame } from "../shared/table-card-frame";

/** Props for the {@link DetailPagedTable} sub-component. */
export interface CrudDetailTableProps {
  /** The table — a `Table` with its own header row and column widths. */
  children: ReactNode;
  /**
   * The paging, for a table whose rows come a page at a time.
   *
   * <p><b>Absent means the table has no pages, not that it forgot them.</b> A fixed catalogue —
   * the four sharing modes, the eleven states a record moves through — has every row it will ever
   * have, and a pager under it would promise a second page that does not exist. A collection that
   * grows and arrives without these is the defect, and it is one only a person can see: the
   * component cannot tell a catalogue of eleven from a history of eleven-so-far.
   */
  page?: number;
  /** How many rows a page holds. */
  pageSize?: number;
  /** How many rows there are in total, across every page. */
  total?: number;
  /**
   * How many pages that comes to.
   *
   * <p>Taken rather than derived, for the reason {@link CrudDetailListProps.totalPages} gives: the
   * server that counted the rows is the one that decided how they divide.
   */
  totalPages?: number;
  /** Called with the page the reader asked for. */
  onPageChange?: (page: number) => void;
  /** Additional classes merged onto the card. */
  className?: string;
}

/**
 * A sub-list inside a detail panel that needs COLUMNS, with the list's own pager docked under it.
 *
 * <p><b>The other half of {@link CrudDetail.List}, and the two are chosen by one question: does the
 * reader compare values down a column?</b> A name and a value beside it — the accounts holding a
 * role, the grants on a scope — is a `List`, and its rows can be any width because nothing is read
 * against the row above. A change history is not: 원값 and 신값 are read as columns, and a row
 * whose cells sit at different x has stopped being a table. Anything with a header row is a
 * `Table`; a name-and-value pair is a `List`.
 *
 * <p><b>Four screens were building this frame by hand.</b> A `Card` clipped to its corners, a
 * sideways scroll inside it, a table, and a pager underneath — assembled separately each time,
 * which is why one of them had the pager inside the scroll region and another had no pager at all.
 * The frame here is `TableCardFrame`, the same one `CrudList.TableCard` and `CrudTree.TableCard`
 * use, so a table in a panel and a table on a list screen are one surface rather than two that
 * resemble each other.
 *
 * <p><b>The pager renders only when there is more than one page</b>, for the reason `List` gives:
 * a single page of four rows with a pager under it reads as a list that failed to load the rest.
 *
 * <p><b>What it does not take is the header.</b> Column widths belong to the table — a change
 * history's five columns and a session list's four divide their width differently — so the caller
 * writes the header row and this frames it.
 *
 * @example
 * ```tsx
 * <CrudDetail.Table
 *   page={history.page}
 *   pageSize={history.pageSize}
 *   total={history.total}
 *   totalPages={history.totalPages}
 *   onPageChange={history.setPage}
 * >
 *   <Table>
 *     <TableHeader>…</TableHeader>
 *     <TableBody>…</TableBody>
 *   </Table>
 * </CrudDetail.Table>
 * ```
 */
export function DetailPagedTable({
  children,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  className,
}: CrudDetailTableProps) {
  return (
    <TableCardFrame className={className}>
      {children}
      {totalPages != null && totalPages > 1 && onPageChange && (
        <CrudList.Pagination
          page={page ?? 0}
          pageSize={pageSize ?? 0}
          total={total ?? 0}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </TableCardFrame>
  );
}
