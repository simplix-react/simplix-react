import { cva } from "class-variance-authority";
import {
  type ComponentPropsWithRef,
  type RefObject,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import {
  tableBodyStyle,
  tableCaptionStyle,
  tableCellStyle,
  tableContainerStyle,
  tableFooterStyle,
  tableHeadStyle,
  tableHeaderStyle,
  tableRowStyle,
  tableStyle,
} from "./table.style";

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
 * the thead is translated to the ancestor scrollport top on each scroll, so
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
// Sideways overflow
// ---------------------------------------------------------------------------

/** Which edges of a sideways-scrolling container have content past them. */
export type TableScrollEdge = "start" | "end" | "both";

/**
 * The edges of the container that hide part of its table, or `undefined` while the table fits.
 *
 * <p>A table wider than its box scrolls sideways, and on a system with overlay scrollbars nothing
 * says so until the reader happens to scroll: the columns past the edge read as missing. The edge
 * is therefore marked (the design fades it), and the box becomes a focusable region so a reader
 * without a pointer can scroll it with the arrow keys. Read again on scroll and on any resize of
 * the box or the table, since a column dropping or a row loading changes the answer.
 */
function useScrollEdge(ref: RefObject<HTMLDivElement | null>): TableScrollEdge | undefined {
  const [edge, setEdge] = useState<TableScrollEdge | undefined>(undefined);
  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    let settling = false;
    const read = () => {
      // A column sliding in or out is drawn with a transform, which overflows the box while it runs
      // and ends without an event; the box is read again once every running animation in it ends.
      const running = typeof box.getAnimations === "function" ? box.getAnimations({ subtree: true }).filter((a) => a.playState === "running") : [];
      if (running.length > 0 && !settling) {
        settling = true;
        void Promise.allSettled(running.map((a) => a.finished)).then(() => {
          settling = false;
          schedule();
        });
      }
      const hidden = box.scrollWidth - box.clientWidth;
      if (hidden <= 1) return setEdge(undefined);
      // scrollLeft is negative in a right-to-left box; its magnitude is the distance from the start.
      const offset = Math.abs(box.scrollLeft);
      const start = offset > 1;
      const end = offset < hidden - 1;
      setEdge(start && end ? "both" : start ? "start" : end ? "end" : undefined);
    };
    let frame = 0;
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => schedule());
    // The table element can be replaced under the box (a loading state, a remount), so the one
    // observed is checked on every read and the current one observed instead.
    let table: HTMLTableElement | null = null;
    const follow = () => {
      const current = box.querySelector("table");
      if (current === table) return;
      if (table) observer?.unobserve(table);
      table = current;
      if (table) observer?.observe(table);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; follow(); read(); });
    };
    follow();
    read();
    box.addEventListener("scroll", read, { passive: true });
    observer?.observe(box);
    // A column dropped or a row loaded changes what overflows without always resizing the table box
    // (a table at its container's width stays that wide), so a change of the cells is read too.
    const cells = typeof MutationObserver === "undefined" ? undefined : new MutationObserver(schedule);
    cells?.observe(box, { childList: true, subtree: true });
    return () => {
      box.removeEventListener("scroll", read);
      observer?.disconnect();
      cells?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);
  return edge;
}

// ---------------------------------------------------------------------------
// Container variants (outer div)
// ---------------------------------------------------------------------------

const tableContainerLayout = cva("relative w-full", {
  variants: {
    rounded: {
      none: "",
      sm: "overflow-hidden",
      md: "overflow-hidden",
      lg: "overflow-hidden",
    },
  },
  defaultVariants: { rounded: "none" },
});

// ---------------------------------------------------------------------------
// Height maps (structure; the paddings are drawn by the slot declarations)
// ---------------------------------------------------------------------------

const headHMap = { sm: "h-8", md: "h-10", lg: "h-12" } as const;
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
  /**
   * How the columns take their widths.
   *
   * <p>`"auto"` (the default) sizes each column to its content, which is right for a table with
   * room to spread. `"fixed"` divides the declared widths and gives the rest to the columns that
   * declared none, which is what a column of free text needs: under `auto` a long value has no
   * bound to be cut to, so a truncating cell never truncates and the table widens instead. In a
   * panel that shows as a sideways scrollbar with the row's actions past the right edge, and a
   * short label in a squeezed neighbour broken one character to a line.
   */
  layout?: "auto" | "fixed";
  /**
   * The name a screen reader gives the box while the table scrolls sideways, when it becomes a
   * focusable region. Defaults to the package's generic 「table」 wording; a list passes its own.
   */
  scrollLabel?: string;
};

export const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    { className, variant = "default", size = "md", density, rounded = "none", maxHeight, fill, stickyHeader, layout, scrollLabel, children, ...rest },
    ref,
  ) => {
    const scrolls = maxHeight != null || fill;
    const ancestorSticky = !!stickyHeader && !scrolls;
    const containerRef = useRef<HTMLDivElement>(null);
    useAncestorStickyHeader(containerRef, ancestorSticky);
    const { t } = useTranslation("simplix/ui");
    const scrollEdge = useScrollEdge(containerRef);
    return (
    <TableContext.Provider value={{ variant, size, density, stickyHeader, ownScroll: scrolls }}>
      <div
        ref={containerRef}
        data-sticky-header={ancestorSticky ? "ancestor" : undefined}
        data-scroll-edge={scrollEdge}
        role={scrollEdge ? "region" : undefined}
        aria-label={scrollEdge ? (scrollLabel ?? t("table.scrollRegion")) : undefined}
        tabIndex={scrollEdge ? 0 : undefined}
        className={cn(
          tableContainerLayout({ rounded }),
          scrolls ? "overflow-auto" : "overflow-x-auto",
          fill && "min-h-0 flex-1",
        )}
        style={maxHeight != null ? { maxHeight } : undefined}
        {...slotAttributes(tableContainerStyle, { rounded, bordered: variant === "bordered" })}
      >
        <table
          ref={ref}
          className={cn("w-full caption-bottom", layout === "fixed" && "table-fixed", className)}
          {...rest}
          {...slotAttributes(tableStyle, { bordered: variant === "bordered" })}
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
        className={className}
        {...rest}
        {...slotAttributes(tableHeaderStyle, { framed: !!(stickyHeader && ownScroll) })}
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
        className={className}
        {...rest}
        {...slotAttributes(tableBodyStyle, { framed: !!(stickyHeader && ownScroll) })}
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
      className={className}
      {...rest}
      {...slotAttributes(tableFooterStyle, {})}
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
        className={className}
        {...rest}
        {...slotAttributes(tableRowStyle, { variant })}
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
        className={cn(
          "align-middle",
          density ? densityHeadHMap[density] : headHMap[size],
          // Own scroll region (framed card): CSS sticky.
          stickyHeader && ownScroll && "sticky top-0 z-10",
          className,
        )}
        {...rest}
        {...slotAttributes(tableHeadStyle, {
          size,
          bordered: variant === "bordered",
          sticky: !stickyHeader ? "none" : ownScroll ? "scroll" : "floating",
        })}
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
        className={cn(
          "align-middle",
          // A single status/enum pill fills a uniform min width so a column's
          // badges line up regardless of label length - whether it is the cell's
          // own child or the lone child of an alignment wrapper. Multi-badge /
          // chip cells hold several badges, so `:only-child` leaves them untouched.
          "[&>[data-slot=badge]:not([data-compact])]:min-w-20",
          "[&>*>[data-slot=badge]:not([data-compact]):only-child]:min-w-20",
          "[&>[data-slot=status-badge]]:min-w-20",
          "[&>*>[data-slot=status-badge]:only-child]:min-w-20",
          className,
        )}
        {...rest}
        {...slotAttributes(tableCellStyle, { size, density, bordered: variant === "bordered" })}
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
      className={className}
      {...rest}
      {...slotAttributes(tableCaptionStyle, {})}
    />
  ),
);

TableCaption.displayName = "TableCaption";
