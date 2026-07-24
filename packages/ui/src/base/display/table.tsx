import { cva } from "class-variance-authority";
import {
  type ComponentPropsWithRef,
  type RefObject,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
} from "react";

import { cn } from "../../utils/cn";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface TableContextValue {
  variant: "default" | "striped" | "bordered";
  size: "sm" | "md" | "lg";
  density?: "compact" | "default" | "comfortable";
  /** When true, header cells stick to the top of the scroll container. */
  stickyHeader?: boolean;
  /** True when the table container is the scroll region itself (`maxHeight`/`fill`). */
  ownScroll?: boolean;
}

const TableContext = createContext<TableContextValue>({
  variant: "default",
  size: "md",
});

const useTableContext = () => useContext(TableContext);

// ---------------------------------------------------------------------------
// Ancestor-driven sticky header
// ---------------------------------------------------------------------------

/** Nearest ancestor that vertically scrolls right now, or null for the window. */
function findScrollParent(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

/**
 * Emulates `position: sticky` for the header of a table whose container
 * manages horizontal overflow. CSS sticky confines cells to the nearest
 * scroll container, so a horizontally scrollable wrapper would keep the
 * header from ever reaching the ancestor that scrolls vertically. Instead,
 * the thead is translated to the ancestor scrollport top on each scroll —
 * the header keeps scrolling horizontally with its columns while it floats.
 */
function useAncestorStickyHeader(ref: RefObject<HTMLDivElement | null>, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const container = ref.current;
    if (!container) return;

    const update = () => {
      const thead = container.querySelector<HTMLElement>("thead");
      if (!thead) return;
      const scroller = findScrollParent(container);
      const viewportTop = scroller ? scroller.getBoundingClientRect().top + scroller.clientTop : 0;
      const rect = container.getBoundingClientRect();
      const maxOffset = Math.max(rect.height - thead.offsetHeight, 0);
      const offset = Math.min(Math.max(viewportTop - rect.top, 0), maxOffset);
      thead.style.transform = offset > 0 ? `translate3d(0, ${offset}px, 0)` : "";
    };

    let raf = 0;
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); });
    };
    // Capture-phase window listener sees scroll events of every ancestor,
    // so the header follows whichever container actually scrolls.
    window.addEventListener("scroll", schedule, { capture: true, passive: true });
    window.addEventListener("resize", schedule);
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(container);
    update();

    return () => {
      window.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
      resizeObserver.disconnect();
      if (raf) cancelAnimationFrame(raf);
      const thead = container.querySelector<HTMLElement>("thead");
      if (thead) thead.style.transform = "";
    };
  }, [ref, enabled]);
}

// ---------------------------------------------------------------------------
// Container variants (outer div)
// ---------------------------------------------------------------------------

const tableContainerVariants = cva("relative w-full", {
  variants: {
    rounded: {
      none: "",
      sm: "rounded-sm overflow-hidden",
      md: "rounded-md overflow-hidden",
      lg: "rounded-lg overflow-hidden",
    },
  },
  defaultVariants: { rounded: "none" },
});

// ---------------------------------------------------------------------------
// Size / density maps
// ---------------------------------------------------------------------------

const headPxMap = { sm: "px-2", md: "px-3", lg: "px-4" } as const;
const headHMap = { sm: "h-8", md: "h-10", lg: "h-12" } as const;

const cellPxMap = { sm: "px-2", md: "px-3", lg: "px-4" } as const;
const cellPyMap = { sm: "py-1.5", md: "py-2.5", lg: "py-4" } as const;

const densityCellPyMap = { compact: "py-1.5", default: "py-2.5", comfortable: "py-3" } as const;
const densityHeadHMap = { compact: "h-8", default: "h-9", comfortable: "h-11" } as const;

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

export type TableProps = ComponentPropsWithRef<"table"> & {
  variant?: "default" | "striped" | "bordered";
  size?: "sm" | "md" | "lg";
  density?: "compact" | "default" | "comfortable";
  rounded?: "none" | "sm" | "md" | "lg";
  /** Bounds the scroll container height so the body scrolls vertically. Pair with `stickyHeader`. */
  maxHeight?: number | string;
  /** Fills a height-bounded flex parent (`flex-1 min-h-0`) instead of using `maxHeight`. */
  fill?: boolean;
  /**
   * Sticks the header to the top of the scroll container while the body scrolls.
   * With `maxHeight`/`fill` the table owns the scroll region and CSS sticky is
   * used; without them the header follows the nearest scrollable ancestor
   * (e.g. a page, dialog, or detail-pane body) via a scroll-synced transform,
   * so the container keeps its own horizontal scrollbar.
   */
  stickyHeader?: boolean;
};

export const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    { className, variant = "default", size = "md", density, rounded = "none", maxHeight, fill, stickyHeader, children, ...rest },
    ref,
  ) => {
    const scrolls = maxHeight != null || fill;
    const ancestorSticky = !!stickyHeader && !scrolls;
    const containerRef = useRef<HTMLDivElement>(null);
    useAncestorStickyHeader(containerRef, ancestorSticky);
    return (
    <TableContext.Provider value={{ variant, size, density, stickyHeader, ownScroll: scrolls }}>
      <div
        ref={containerRef}
        data-slot="table-container"
        data-sticky-header={ancestorSticky ? "ancestor" : undefined}
        className={cn(
          tableContainerVariants({ rounded }),
          scrolls ? "overflow-auto" : "overflow-x-auto",
          fill && "min-h-0 flex-1",
          variant === "bordered" && "border border-border",
        )}
        style={maxHeight != null ? { maxHeight } : undefined}
      >
        <table
          ref={ref}
          data-slot="table"
          className={cn(
            "w-full caption-bottom text-base",
            variant === "bordered" && "border-separate border-spacing-0",
            className,
          )}
          {...rest}
        >
          {children}
        </table>
      </div>
    </TableContext.Provider>
    );
  },
);

Table.displayName = "Table";

// ---------------------------------------------------------------------------
// TableHeader
// ---------------------------------------------------------------------------

export type TableHeaderProps = ComponentPropsWithRef<"thead">;

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...rest }, ref) => {
    const { stickyHeader, ownScroll } = useTableContext();
    return (
      <thead
        ref={ref}
        data-slot="table-header"
        className={cn(
          // A framed card (own scroll region) draws the top edge; thead
          // border-t would double it. Unframed tables keep their own edge.
          !(stickyHeader && ownScroll) && "border-t border-border",
          "bg-muted/40 [&_tr]:border-b [&_tr]:border-border-strong",
          className,
        )}
        {...rest}
      />
    );
  },
);

TableHeader.displayName = "TableHeader";

// ---------------------------------------------------------------------------
// TableBody
// ---------------------------------------------------------------------------

export type TableBodyProps = ComponentPropsWithRef<"tbody">;

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...rest }, ref) => {
    const { stickyHeader, ownScroll } = useTableContext();
    return (
      <tbody
        ref={ref}
        data-slot="table-body"
        className={cn(
          // Framed (own scroll region): card bottom / pagination border-t is
          // the closing line, so the last row's border-b would double it.
          stickyHeader && ownScroll && "[&>tr:last-child]:border-b-0",
          className,
        )}
        {...rest}
      />
    );
  },
);

TableBody.displayName = "TableBody";

// ---------------------------------------------------------------------------
// TableFooter
// ---------------------------------------------------------------------------

export type TableFooterProps = ComponentPropsWithRef<"tfoot">;

export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...rest }, ref) => (
    <tfoot
      ref={ref}
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...rest}
    />
  ),
);

TableFooter.displayName = "TableFooter";

// ---------------------------------------------------------------------------
// TableRow
// ---------------------------------------------------------------------------

export type TableRowProps = ComponentPropsWithRef<"tr">;

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...rest }, ref) => {
    const { variant } = useTableContext();
    return (
      <tr
        ref={ref}
        data-slot="table-row"
        className={cn(
          "border-b border-border transition-colors",
          variant === "default" && "hover:bg-muted/40",
          variant === "striped" && "even:bg-muted/50",
          variant === "bordered" && "hover:bg-muted/50",
          className,
        )}
        {...rest}
      />
    );
  },
);

TableRow.displayName = "TableRow";

// ---------------------------------------------------------------------------
// TableHead
// ---------------------------------------------------------------------------

export type TableHeadProps = ComponentPropsWithRef<"th">;

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...rest }, ref) => {
    const { size, variant, density, stickyHeader, ownScroll } = useTableContext();
    return (
      <th
        ref={ref}
        data-slot="table-head"
        className={cn(
          "text-left align-middle text-xs font-semibold tracking-[0.01em] text-muted-foreground [&:has([role=checkbox])]:pr-0",
          headPxMap[size],
          density ? densityHeadHMap[density] : headHMap[size],
          variant === "bordered" && "border border-border",
          // Sticky header: th carries its own bg + borders so they travel with
          // the floating cell (thead's borders stay at the layout position).
          // The bg must be opaque (same tone as bg-muted/40 over the page
          // background) so rows do not show through while it floats.
          stickyHeader && "bg-[color-mix(in_srgb,var(--muted)_40%,var(--background))] border-b border-border",
          // Own scroll region (framed card): CSS sticky, card draws the top
          // edge. Otherwise the transform in useAncestorStickyHeader moves the
          // thead, which paints above the in-flow rows on its own.
          stickyHeader && ownScroll && "sticky top-0 z-10",
          stickyHeader && !ownScroll && "border-t border-border",
          className,
        )}
        {...rest}
      />
    );
  },
);

TableHead.displayName = "TableHead";

// ---------------------------------------------------------------------------
// TableCell
// ---------------------------------------------------------------------------

export type TableCellProps = ComponentPropsWithRef<"td">;

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...rest }, ref) => {
    const { size, variant, density } = useTableContext();
    return (
      <td
        ref={ref}
        data-slot="table-cell"
        className={cn(
          // Data cells default to text-sm (the header row is text-xs); keeps record
          // typography consistent so bare cells don't inherit the table root's text-base.
          "align-middle text-sm [&:has([role=checkbox])]:pr-0",
          // A single status/enum pill fills a uniform min width so a column's
          // badges line up regardless of label length — whether it is the cell's
          // own child or the lone child of an alignment wrapper. Multi-badge /
          // chip cells hold several badges, so `:only-child` leaves them untouched.
          "[&>[data-slot=badge]]:min-w-20",
          "[&>*>[data-slot=badge]:only-child]:min-w-20",
          cellPxMap[size],
          density ? densityCellPyMap[density] : cellPyMap[size],
          variant === "bordered" && "border border-border",
          className,
        )}
        {...rest}
      />
    );
  },
);

TableCell.displayName = "TableCell";

// ---------------------------------------------------------------------------
// TableCaption
// ---------------------------------------------------------------------------

export type TableCaptionProps = ComponentPropsWithRef<"caption">;

export const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...rest }, ref) => (
    <caption
      ref={ref}
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...rest}
    />
  ),
);

TableCaption.displayName = "TableCaption";
