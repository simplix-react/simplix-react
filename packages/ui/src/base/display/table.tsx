import { cva } from "class-variance-authority";
import { type ComponentPropsWithRef, createContext, forwardRef, useContext } from "react";

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
}

const TableContext = createContext<TableContextValue>({
  variant: "default",
  size: "md",
});

const useTableContext = () => useContext(TableContext);

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
  /** Sticks header cells to the top of the scroll container while the body scrolls. */
  stickyHeader?: boolean;
};

export const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    { className, variant = "default", size = "md", density, rounded = "none", maxHeight, fill, stickyHeader, children, ...rest },
    ref,
  ) => {
    const scrolls = maxHeight != null || fill;
    return (
    <TableContext.Provider value={{ variant, size, density, stickyHeader }}>
      <div
        data-slot="table-container"
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
  ({ className, ...rest }, ref) => (
    <thead
      ref={ref}
      data-slot="table-header"
      className={cn(
        "border-t border-border bg-muted/40 [&_tr]:border-b [&_tr]:border-border-strong",
        className,
      )}
      {...rest}
    />
  ),
);

TableHeader.displayName = "TableHeader";

// ---------------------------------------------------------------------------
// TableBody
// ---------------------------------------------------------------------------

export type TableBodyProps = ComponentPropsWithRef<"tbody">;

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...rest }, ref) => (
    <tbody
      ref={ref}
      data-slot="table-body"
      className={cn("", className)}
      {...rest}
    />
  ),
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
    const { size, variant, density, stickyHeader } = useTableContext();
    return (
      <th
        ref={ref}
        data-slot="table-head"
        className={cn(
          "text-left align-middle text-xs font-semibold tracking-[0.01em] text-muted-foreground [&:has([role=checkbox])]:pr-0",
          headPxMap[size],
          density ? densityHeadHMap[density] : headHMap[size],
          variant === "bordered" && "border border-border",
          // Sticky header: th carries its own bg + bottom border so it survives scrolling.
          stickyHeader && "sticky top-0 z-10 bg-muted/40 border-b border-border",
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
          "align-middle [&:has([role=checkbox])]:pr-0",
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
