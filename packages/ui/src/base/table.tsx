import { cva } from "class-variance-authority";
import { type ComponentPropsWithRef, createContext, forwardRef, useContext } from "react";

import { cn } from "../utils/cn";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface TableContextValue {
  variant: "default" | "striped" | "bordered";
  size: "sm" | "md" | "lg";
}

const TableContext = createContext<TableContextValue>({
  variant: "default",
  size: "md",
});

const useTableContext = () => useContext(TableContext);

// ---------------------------------------------------------------------------
// Container variants (outer div)
// ---------------------------------------------------------------------------

const tableContainerVariants = cva("relative w-full overflow-x-auto", {
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
// Size maps
// ---------------------------------------------------------------------------

const headSizeMap = {
  sm: "h-8 px-2",
  md: "h-10 px-3",
  lg: "h-12 px-4",
} as const;

const cellSizeMap = {
  sm: "px-2 py-1.5",
  md: "px-3 py-2.5",
  lg: "px-4 py-4",
} as const;

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

export type TableProps = ComponentPropsWithRef<"table"> & {
  variant?: "default" | "striped" | "bordered";
  size?: "sm" | "md" | "lg";
  rounded?: "none" | "sm" | "md" | "lg";
};

export const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    { className, variant = "default", size = "md", rounded = "none", children, ...rest },
    ref,
  ) => (
    <TableContext.Provider value={{ variant, size }}>
      <div
        data-slot="table-container"
        className={cn(
          tableContainerVariants({ rounded }),
          variant === "bordered" && "border border-border",
        )}
      >
        <table
          ref={ref}
          data-slot="table"
          className={cn(
            "w-full caption-bottom text-sm",
            variant === "bordered" && "border-separate border-spacing-0",
            className,
          )}
          {...rest}
        >
          {children}
        </table>
      </div>
    </TableContext.Provider>
  ),
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
      className={cn("[&_tr]:border-b", className)}
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
      className={cn("[&_tr:last-child]:border-0", className)}
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
          variant === "default" && "hover:bg-muted/50",
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
    const { size, variant } = useTableContext();
    return (
      <th
        ref={ref}
        data-slot="table-head"
        className={cn(
          "text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
          headSizeMap[size],
          variant === "bordered" && "border border-border",
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
    const { size, variant } = useTableContext();
    return (
      <td
        ref={ref}
        data-slot="table-cell"
        className={cn(
          "align-middle [&:has([role=checkbox])]:pr-0",
          cellSizeMap[size],
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
