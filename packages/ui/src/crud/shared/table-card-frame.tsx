import { createContext, type ReactNode, useContext, useMemo } from "react";

import { cn } from "../../utils/cn";

// ── Table card frame ──
//
// A bordered "card" that frames a table (and optionally a docked footer such as
// pagination) as one surface: the table becomes the scroll region with a sticky
// header. Shared by CrudList.TableCard and CrudTree.TableCard so both card
// designs stay visually identical.

/** Frame state published by a TableCardFrame to descendant tables/footers. */
export interface TableCardFrameValue {
  framed: boolean;
  /** Bounds the table body height so it scrolls while the header sticks. */
  maxHeight?: number | string;
  /** Fills a height-bounded flex parent instead of using `maxHeight`. */
  fill?: boolean;
}

export const TableCardFrameContext = createContext<TableCardFrameValue | null>(null);

/** Reads the surrounding TableCardFrame, or null when rendered standalone. */
export function useTableCardFrame(): TableCardFrameValue | null {
  return useContext(TableCardFrameContext);
}

/** Props for the TableCardFrame wrapper. */
export interface TableCardFrameProps {
  /** Bounds the table body height so it scrolls while the header sticks. Works in any layout. */
  maxHeight?: number | string;
  /** Fills a height-bounded flex parent instead of using `maxHeight` (e.g. list-detail pane). */
  fill?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Wraps a table in one bordered card with a sticky-header scroll region. Opt-in —
 * without it, the table renders unframed.
 */
export function TableCardFrame({ maxHeight, fill, className, children }: TableCardFrameProps) {
  const value = useMemo<TableCardFrameValue>(() => ({ framed: true, maxHeight, fill }), [maxHeight, fill]);
  return (
    <TableCardFrameContext.Provider value={value}>
      <div className={cn("flex flex-col overflow-hidden rounded-lg border bg-card", fill && "min-h-0 flex-1", className)}>
        {children}
      </div>
    </TableCardFrameContext.Provider>
  );
}
