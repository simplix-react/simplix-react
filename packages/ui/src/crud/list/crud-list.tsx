import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  type ReactNode,
  createElement,
  useCallback,
  useMemo,
  useRef,
} from "react";

import { Badge, type BadgeVariants } from "../../base/badge";
import { Input } from "../../base/input";
import { Skeleton } from "../../base/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../base/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableProps,
} from "../../base/table";
import { Flex } from "../../primitives/flex";
import { Stack } from "../../primitives/stack";
import { cn } from "../../utils/cn";
import type { EmptyReason, SortState } from "../shared/types";
import { useContainerWidth } from "./use-container-width";

// ── List Root ──

/** Props for the {@link CrudList} compound component root. */
export interface ListProps {
  compact?: boolean;
  className?: string;
  children?: ReactNode;
}

function ListRoot({ compact, className, children }: ListProps) {
  return (
    <Stack
      gap={compact ? "sm" : "md"}
      className={cn("w-full", className)}
      data-testid="crud-list"
    >
      {children}
    </Stack>
  );
}

// ── List.Toolbar ──

/** Props for the List.Toolbar sub-component. */
export interface ListToolbarProps {
  className?: string;
  children?: ReactNode;
}

function ListToolbar({ className, children }: ListToolbarProps) {
  return (
    <Flex
      gap="sm"
      align="center"
      wrap
      className={cn("w-full", className)}
    >
      {children}
    </Flex>
  );
}

// ── List.Search ──

/** Props for the List.Search sub-component. */
export interface ListSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function ListSearch({ value, onChange, placeholder = "Search...", className }: ListSearchProps) {
  return (
    <Input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn("max-w-xs", className)}
    />
  );
}

// ── List.Filter ──

/** Option item for the List.Filter select dropdown. */
export interface ListFilterOption {
  label: string;
  value: string;
}

/** Props for the List.Filter sub-component. */
export interface ListFilterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ListFilterOption[];
  placeholder?: string;
  className?: string;
}

function ListFilter({
  label,
  value,
  onChange,
  options,
  placeholder,
  className,
}: ListFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-[180px]", className)} aria-label={label}>
        <SelectValue placeholder={placeholder ?? label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ── Sort Icon SVG ──

function SortIcon({ direction }: { direction: "asc" | "desc" | null }) {
  if (!direction) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="ml-1 inline-block opacity-30"
        aria-hidden="true"
      >
        <path d="M8 4L11 7H5L8 4Z" fill="currentColor" />
        <path d="M8 12L5 9H11L8 12Z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="ml-1 inline-block"
      aria-hidden="true"
    >
      {direction === "asc" ? (
        <path d="M8 4L11 8H5L8 4Z" fill="currentColor" />
      ) : (
        <path d="M8 12L5 8H11L8 12Z" fill="currentColor" />
      )}
    </svg>
  );
}

// ── List.Column (definition, not rendered directly) ──

/** Declarative column definition for List.Table. Not rendered directly. */
export interface ListColumnProps<T> {
  field?: keyof T & string;
  header?: string;
  sortable?: boolean;
  width?: number;
  display?: "badge";
  format?: "date" | "datetime" | "relative";
  variants?: Record<string, BadgeVariants["variant"]>;
  children?: (props: { value: unknown; row: T }) => ReactNode;
}

// ListColumn is not rendered directly; it's used for declaration.
function ListColumn<T>(_props: ListColumnProps<T>): ReactNode {
  return null;
}

// ── Format helpers ──

function formatCellValue(value: unknown, format?: "date" | "datetime" | "relative"): string {
  if (value == null) return "";
  if (!format) return String(value);

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  if (format === "date") {
    return date.toLocaleDateString();
  }
  if (format === "datetime") {
    return date.toLocaleString();
  }
  // relative
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── List.Table ──

/** Props for the List.Table sub-component built on TanStack Table. */
export interface ListTableProps<T> {
  data: T[];
  isLoading?: boolean;
  sort?: SortState | null;
  onSortChange?: (sort: SortState) => void;
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  /** Highlights the row whose `rowId` matches this value. */
  activeRowId?: string | null;
  selectedIndices?: Set<number>;
  onSelectionChange?: (index: number) => void;
  onSelectAll?: () => void;
  rowId?: (row: T) => string;
  /** Container width threshold (px) below which card mode activates. Disabled when omitted. */
  cardBreakpoint?: number;
  /** Render prop for card content. Card interactions (click, selection) are handled by the framework. */
  cardRender?: (props: { row: T; index: number }) => ReactNode;
  /** Table visual variant. */
  variant?: TableProps["variant"];
  /** Cell padding size. */
  size?: TableProps["size"];
  /** Container border radius. */
  rounded?: TableProps["rounded"];
  className?: string;
  children?: ReactNode;
}

function extractColumnDefs<T>(children: ReactNode): ListColumnProps<T>[] {
  const columns: ListColumnProps<T>[] = [];
  const childArray = Array.isArray(children) ? children : [children];

  for (const child of childArray) {
    if (child && typeof child === "object" && "props" in child) {
      const props = child.props as ListColumnProps<T>;
      if (props.field !== undefined || props.children !== undefined) {
        columns.push(props);
      }
    }
  }

  return columns;
}

function ListTable<T>({
  data,
  isLoading,
  sort,
  onSortChange,
  selectable,
  onRowClick,
  activeRowId,
  selectedIndices,
  onSelectionChange,
  onSelectAll,
  rowId,
  cardBreakpoint,
  cardRender,
  variant,
  size,
  rounded,
  className,
  children,
}: ListTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);
  const isCardMode = !!(
    cardBreakpoint &&
    cardRender &&
    containerWidth > 0 &&
    containerWidth < cardBreakpoint
  );

  const columnDefs = useMemo(() => extractColumnDefs<T>(children), [children]);

  const sorting: SortingState = sort?.field
    ? [{ id: sort.field, desc: sort.direction === "desc" }]
    : [];

  const handleSortChange = useCallback(
    (field: string) => {
      if (!onSortChange) return;
      if (sort?.field === field) {
        onSortChange({
          field,
          direction: sort.direction === "asc" ? "desc" : "asc",
        });
      } else {
        onSortChange({ field, direction: "asc" });
      }
    },
    [sort, onSortChange],
  );

  const tanstackColumns = useMemo((): ColumnDef<T>[] => {
    const cols: ColumnDef<T>[] = [];

    if (selectable) {
      cols.push({
        id: "_selection",
        header: () => (
          <input
            type="checkbox"
            checked={selectedIndices?.size === data.length && data.length > 0}
            onChange={() => onSelectAll?.()}
            className="h-4 w-4 rounded border-gray-300"
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIndices?.has(row.index) ?? false}
            onChange={() => onSelectionChange?.(row.index)}
            className="h-4 w-4 rounded border-gray-300"
            aria-label={`Select row ${row.index + 1}`}
          />
        ),
        size: 40,
      });
    }

    for (let i = 0; i < columnDefs.length; i++) {
      const colDef = columnDefs[i];
      cols.push({
        id: colDef.field ?? `_col_${i}`,
        accessorFn: colDef.field
          ? (row) => (row as Record<string, unknown>)[colDef.field!]
          : () => null,
        header: () => {
          const isSorted = colDef.field ? sort?.field === colDef.field : false;
          const dir = isSorted ? sort!.direction : null;

          if (colDef.sortable && colDef.field) {
            return (
              <button
                type="button"
                onClick={() => handleSortChange(colDef.field!)}
                className="inline-flex items-center font-medium hover:text-foreground"
              >
                {colDef.header ?? ""}
                <SortIcon direction={dir} />
              </button>
            );
          }
          return colDef.header ?? "";
        },
        cell: ({ getValue, row }) => {
          const value = getValue();

          // Custom render prop
          if (colDef.children) {
            return colDef.children({ value, row: row.original });
          }

          // Badge display
          if (colDef.display === "badge" && colDef.variants) {
            const strVal = String(value ?? "");
            const variant = colDef.variants[strVal] ?? "default";
            return <Badge variant={variant}>{strVal}</Badge>;
          }

          // Format
          return formatCellValue(value, colDef.format);
        },
        size: colDef.width,
      });
    }

    return cols;
  }, [
    columnDefs,
    selectable,
    selectedIndices,
    data.length,
    sort,
    handleSortChange,
    onSelectAll,
    onSelectionChange,
  ]);

  const table = useReactTable({
    data,
    columns: tanstackColumns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  return (
    <div ref={containerRef} className={cn("w-full", !isCardMode && "overflow-x-auto")}>
      {isCardMode ? (
        <div key="card" className="animate-in fade-in-0 duration-200">
          <Stack gap="sm">
            {selectable && (
              <Flex align="center" className="px-1">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={selectedIndices?.size === data.length && data.length > 0}
                    onChange={() => onSelectAll?.()}
                    className="h-4 w-4 rounded border-gray-300"
                    aria-label="Select all"
                  />
                  Select all
                </label>
              </Flex>
            )}
            {isLoading && data.length === 0
              ? Array.from({ length: 3 }, (_, i) => (
                  <div key={`card-skeleton-${i}`} className="rounded-lg border p-4">
                    <Stack gap="xs">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </Stack>
                  </div>
                ))
              : data.map((row, index) => {
                  const rid = rowId?.(row) ?? String(index);
                  const isSelected = selectedIndices?.has(index);
                  const isActive = activeRowId != null && rid === activeRowId;
                  return (
                    <div
                      key={rid}
                      className={cn(
                        "relative rounded-lg border p-4 transition-colors hover:bg-muted/50",
                        isSelected && "ring-2 ring-primary",
                        isActive && "bg-muted/50",
                        onRowClick && "cursor-pointer",
                      )}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      data-testid={`list-row-${rid}`}
                    >
                      {selectable && (
                        <input
                          type="checkbox"
                          checked={isSelected ?? false}
                          onChange={(e) => {
                            e.stopPropagation();
                            onSelectionChange?.(index);
                          }}
                          className="absolute right-3 top-3 h-4 w-4 rounded border-gray-300"
                          aria-label={`Select row ${index + 1}`}
                        />
                      )}
                      {createElement(cardRender, { row, index })}
                    </div>
                  );
                })}
          </Stack>
        </div>
      ) : (
        <div key="table" className="animate-in fade-in-0 duration-200">
          <Table variant={variant} size={size} rounded={rounded} className={cn("table-auto", className)}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="truncate"
                      style={header.column.getSize() !== 150 ? { width: header.column.getSize() } : undefined}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading && data.length === 0
                ? Array.from({ length: 5 }, (_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      {table.getAllColumns().map((col) => (
                        <TableCell key={col.id}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : table.getRowModel().rows.map((row) => {
                    const rid = rowId?.(row.original) ?? row.id;
                    const isActive = activeRowId != null && rid === activeRowId;
                    return (
                      <TableRow
                        key={row.id}
                        className={cn(
                          selectedIndices?.has(row.index) && "bg-muted/30",
                          isActive && "bg-muted/50",
                          onRowClick && "cursor-pointer",
                        )}
                        onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                        data-testid={`list-row-${rid}`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="truncate">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── List.RowActions ──

/** Props for the List.RowActions container. */
export interface ListRowActionsProps {
  className?: string;
  children?: ReactNode;
}

function ListRowActions({ className, children }: ListRowActionsProps) {
  return (
    <Flex gap="xs" align="center" className={cn("justify-end", className)}>
      {children}
    </Flex>
  );
}

// ── List.Action ──

/** Props for individual row action buttons. */
export interface ListActionProps<T = unknown> {
  action?: "edit" | "delete";
  label?: string;
  icon?: ReactNode;
  onClick?: (row: T) => void;
  when?: (row: T) => boolean;
  variant?: "default" | "destructive";
  className?: string;
}

function ListAction<T>({
  action,
  label,
  onClick,
  variant = action === "delete" ? "destructive" : "default",
  className,
}: ListActionProps<T>) {
  const displayLabel = label ?? (action === "edit" ? "Edit" : action === "delete" ? "Delete" : "Action");

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(undefined as unknown as T);
      }}
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        variant === "destructive"
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-muted",
        className,
      )}
    >
      {displayLabel}
    </button>
  );
}

// ── List.Pagination ──

/** Props for the List.Pagination sub-component. */
export interface ListPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  /** Label shown when total is 0. Defaults to `"No results"`. */
  noResultsLabel?: string;
  /** Label for page-size selector. Defaults to `"Rows:"`. */
  rowsLabel?: string;
  /** Format the range text. Defaults to `` `${start}-${end} of ${total}` ``. */
  rangeLabel?: (start: number, end: number, total: number) => string;
  className?: string;
}

function ListPagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  noResultsLabel = "No results",
  rowsLabel = "Rows:",
  rangeLabel,
  className,
}: ListPaginationProps) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <Flex align="center" justify="between" className={cn("w-full", className)}>
      <span className="text-sm text-muted-foreground">
        {total > 0 ? (rangeLabel ? rangeLabel(start, end, total) : `${start}-${end} of ${total}`) : noResultsLabel}
      </span>
      <Flex gap="sm" align="center">
        {onPageSizeChange && (
          <Flex gap="xs" align="center">
            <span className="text-sm text-muted-foreground">{rowsLabel}</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger className="h-8 w-[70px]" aria-label="Page size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Flex>
        )}
        <Flex gap="xs" align="center">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm disabled:opacity-50"
            aria-label="Previous page"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="text-sm">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm disabled:opacity-50"
            aria-label="Next page"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </Flex>
      </Flex>
    </Flex>
  );
}

// ── List.BulkActions ──

/** Props for the List.BulkActions bar shown when rows are selected. */
export interface ListBulkActionsProps {
  selectedCount: number;
  onClear?: () => void;
  /** Format the selected count label. Defaults to `` `${count} selected` ``. */
  selectedLabel?: (count: number) => string;
  /** Label for the clear button. Defaults to `"Clear"`. */
  clearLabel?: string;
  className?: string;
  children?: ReactNode;
}

function ListBulkActions({ selectedCount, onClear, selectedLabel, clearLabel = "Clear", className, children }: ListBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <Flex
      gap="sm"
      align="center"
      className={cn(
        "rounded-md border bg-muted/50 px-4 py-2",
        className,
      )}
    >
      <span className="text-sm font-medium">
        {selectedLabel ? selectedLabel(selectedCount) : `${selectedCount} selected`}
      </span>
      {children}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="ml-auto text-sm text-muted-foreground hover:text-foreground"
        >
          {clearLabel}
        </button>
      )}
    </Flex>
  );
}

// ── List.BulkAction ──

/** Props for individual bulk action buttons. */
export interface ListBulkActionProps {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
  className?: string;
}

function ListBulkAction({
  label,
  onClick,
  variant = "default",
  className,
}: ListBulkActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        variant === "destructive"
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-muted",
        className,
      )}
    >
      {label}
    </button>
  );
}

// ── List.Empty ──

/** Props for the List.Empty state display. */
export interface ListEmptyProps {
  reason?: EmptyReason;
  /** Override default empty messages per reason. */
  messages?: Partial<Record<EmptyReason, string>>;
  className?: string;
  children?: ReactNode | ((props: { reason: EmptyReason }) => ReactNode);
}

const defaultEmptyMessages: Record<EmptyReason, string> = {
  "no-data": "No data available.",
  "no-filter": "No items match the selected filters.",
  "no-search": "No items match the search query.",
};

function ListEmpty({ reason = "no-data", messages, className, children }: ListEmptyProps) {
  const mergedMessages = messages ? { ...defaultEmptyMessages, ...messages } : defaultEmptyMessages;
  const content = typeof children === "function"
    ? children({ reason })
    : children ?? mergedMessages[reason];

  return (
    <Stack align="center" justify="center" className={cn("py-12", className)}>
      <p className="text-sm text-muted-foreground">{content}</p>
    </Stack>
  );
}

// ── Compound component assembly ──

/**
 * Compound component for building CRUD list views with toolbar, table,
 * pagination, selection, and bulk actions.
 *
 * Sub-components: Toolbar, Search, Filter, Table, Column, RowActions,
 * Action, Pagination, BulkActions, BulkAction, Empty.
 */
export const CrudList = Object.assign(ListRoot, {
  Toolbar: ListToolbar,
  Search: ListSearch,
  Filter: ListFilter,
  Table: ListTable,
  Column: ListColumn,
  RowActions: ListRowActions,
  Action: ListAction,
  Pagination: ListPagination,
  BulkActions: ListBulkActions,
  BulkAction: ListBulkAction,
  Empty: ListEmpty,
});
