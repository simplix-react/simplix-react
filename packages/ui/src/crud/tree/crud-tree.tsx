import { useTranslation } from "@simplix-react/i18n/react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  type TableProps,
} from "../../base";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { Flex, Stack } from "../../primitives";
import { cn } from "../../utils/cn";
import type { ColumnInfo, EmptyReason, SortState } from "../shared";
import type { ActionType, ActionVariant, ListColumnProps, RowActionDef } from "../list/crud-list";
import { ArrowUpDownIcon, ChevronsDownUpIcon, ChevronsUpDownIcon, EyeIcon, FolderTreeIcon, MagnifyingGlassIcon, MapPinIcon, PencilIcon, PlusIcon, TrashIcon, UnlinkIcon, XIcon } from "../shared/icons";
import type { TreeConfig, TreeNodeMetadata } from "./tree-types";
import { useTreeExpansion } from "./use-tree-expansion";
import { filterTreeWithAncestors, getAllNodeIds, treeToFlat } from "./tree-utils";

// ── Icons ──

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden="true">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden="true">
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SortIcon({ direction }: { direction: "asc" | "desc" | null }) {
  if (!direction) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1 inline-block opacity-30" aria-hidden="true">
        <path d="M8 4L11 7H5L8 4Z" fill="currentColor" />
        <path d="M8 12L5 9H11L8 12Z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1 inline-block" aria-hidden="true">
      {direction === "asc" ? (
        <path d="M8 4L11 8H5L8 4Z" fill="currentColor" />
      ) : (
        <path d="M8 12L5 8H11L8 12Z" fill="currentColor" />
      )}
    </svg>
  );
}

// ── Context ──

interface CrudTreeContextValue {
  columns: ColumnInfo[];
  setColumns: (cols: ColumnInfo[]) => void;
  expansion: {
    expandedCount: number;
    totalCount: number;
    expandAll: () => void;
    collapseAll: () => void;
  } | null;
  setExpansion: (exp: CrudTreeContextValue["expansion"]) => void;
  search: string;
  setSearch: (value: string) => void;
}

const CrudTreeContext = createContext<CrudTreeContextValue | null>(null);

function useCrudTreeContext() {
  return useContext(CrudTreeContext);
}

// ── TreeRoot ──

/**
 * Props for the {@link CrudTree} compound component root.
 *
 * ```
 * ┌─────────────────────────────────────────┐
 * │ Toolbar                                 │
 * │ [Search...]  [Expand All] [Collapse]    │
 * ├────┬─────────────────┬─────────┬────────┤
 * │    │ Name            │ Status  │ Action │
 * ├────┼─────────────────┼─────────┼────────┤
 * │ ▼  │ Category A      │ Active  │ [Edit] │
 * │    │  ├─ Item A-1    │ Active  │ [Edit] │
 * │    │  └─ Item A-2    │ Draft   │ [Edit] │
 * │ ▶  │ Category B      │ Active  │ [Edit] │
 * └────┴─────────────────┴─────────┴────────┘
 * ```
 */
export interface TreeProps {
  className?: string;
  children?: ReactNode;
}

function TreeRoot({ className, children }: TreeProps) {
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [expansion, setExpansion] = useState<CrudTreeContextValue["expansion"]>(null);
  const [search, setSearch] = useState("");

  const ctx = useMemo(
    () => ({ columns, setColumns, expansion, setExpansion, search, setSearch }),
    [columns, expansion, search],
  );

  return (
    <CrudTreeContext.Provider value={ctx}>
      <Stack gap="sm" className={cn("w-full", className)} data-testid="crud-tree">
        {children}
      </Stack>
    </CrudTreeContext.Provider>
  );
}

// ── TreeToolbar ──

export interface TreeToolbarProps {
  className?: string;
  children?: ReactNode;
}

function TreeToolbar({ className, children }: TreeToolbarProps) {
  return (
    <Flex
      gap="sm"
      align="center"
      wrap
      className={cn("w-full rounded-lg border bg-card p-2 [&>*]:grow", className)}
    >
      {children}
    </Flex>
  );
}

// ── TreeSearch ──

export interface TreeSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function TreeSearch({ value, onChange, placeholder, className }: TreeSearchProps) {
  const { t } = useTranslation("simplix/ui");
  const { Input } = useFlatUIComponents();
  const ctx = useCrudTreeContext();
  const controlled = value !== undefined;
  return (
    <div className={cn("relative max-w-xs", className)}>
      <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={controlled ? value : (ctx?.search ?? "")}
        onChange={(e) => {
          const v = e.target.value;
          if (controlled) {
            onChange?.(v);
          } else {
            ctx?.setSearch(v);
          }
        }}
        placeholder={placeholder ?? t("tree.searchPlaceholder")}
        className="pl-8"
      />
    </div>
  );
}

// ── TreeExpandToggle ──

function TreeExpandToggle({ className }: { className?: string }) {
  const { t } = useTranslation("simplix/ui");
  const { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } = useFlatUIComponents();
  const ctx = useCrudTreeContext();
  const expansion = ctx?.expansion;

  if (!expansion) return null;

  return (
    <TooltipProvider>
      <Flex gap="xs" align="center" className={cn("!grow-0 ml-auto", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={expansion.expandAll}
            >
              <ChevronsUpDownIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("tree.expandAll")}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={expansion.collapseAll}
            >
              <ChevronsDownUpIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("tree.collapseAll")}</TooltipContent>
        </Tooltip>
      </Flex>
    </TooltipProvider>
  );
}

// ── TreeColumn (declaration only) ──

function TreeColumn<T>(_props: ListColumnProps<T>): ReactNode {
  return null;
}

// ── Action helpers (reused from CrudList pattern) ──

const ACTION_LABEL_KEYS: Record<ActionType, string> = {
  view: "common.view",
  edit: "common.edit",
  delete: "common.delete",
  locate: "common.locate",
  "add-child": "tree.addChild",
  reorder: "tree.reorder",
  move: "tree.move",
  unlink: "common.unlink",
};

const ACTION_ICONS: Record<ActionType, ReactNode> = {
  view: <EyeIcon className="size-4" />,
  edit: <PencilIcon className="size-4" />,
  delete: <TrashIcon className="size-4" />,
  locate: <MapPinIcon className="size-4" />,
  "add-child": <PlusIcon className="size-4" />,
  reorder: <ArrowUpDownIcon className="size-4" />,
  move: <FolderTreeIcon className="size-4" />,
  unlink: <UnlinkIcon className="size-4" />,
};

function getActionColumnWidth(actions: RowActionDef<unknown>[], variant: ActionVariant): number {
  if (variant === "icon") return actions.length * 30 + 4;
  return 120;
}

function RowActionCell<T>({ row, actions, variant }: { row: T; actions: RowActionDef<T>[]; variant: ActionVariant }) {
  const { t } = useTranslation("simplix/ui");
  const { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } = useFlatUIComponents();
  const visible = actions.filter((a) => !a.when || a.when(row));
  if (visible.length === 0) return null;

  const handleClick = (e: React.MouseEvent, action: RowActionDef<T>) => {
    e.stopPropagation();
    action.onClick(row);
  };

  if (variant === "icon") {
    return (
      <TooltipProvider>
        <Flex justify="end" align="center">
          <div className="inline-flex items-center rounded-md border overflow-hidden">
            {visible.map((action, i) => {
              const label = action.label ?? t(ACTION_LABEL_KEYS[action.type]);
              const resolvedIcon = typeof action.icon === "function" ? action.icon(row) : action.icon;
              const icon = resolvedIcon ?? ACTION_ICONS[action.type];
              const isDisabled = action.disabled?.(row) ?? false;
              return (
                <Tooltip key={action.type}>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      className={cn(
                        "rounded-none",
                        i > 0 && "border-l",
                      )}
                      onClick={(e) => handleClick(e, action)}
                      disabled={isDisabled}
                    >
                      {icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </Flex>
      </TooltipProvider>
    );
  }

  return (
    <Flex gap="xs" justify="end">
      {visible.map((action) => {
        const label = action.label ?? t(ACTION_LABEL_KEYS[action.type]);
        const resolvedIcon = typeof action.icon === "function" ? action.icon(row) : action.icon;
        const icon = resolvedIcon ?? ACTION_ICONS[action.type];
        const isDisabled = action.disabled?.(row) ?? false;
        return (
          <Button
            key={action.type}
            size="sm"
            variant={variant}
            onClick={(e) => handleClick(e, action)}
            disabled={isDisabled}
          >
            {icon}
            {label}
          </Button>
        );
      })}
    </Flex>
  );
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

// ── TreeTable ──

export interface TreeTableProps<T> {
  data: T[];
  isLoading?: boolean;
  tree?: TreeConfig<T>;
  sort?: SortState | null;
  onSortChange?: (sort: SortState) => void;
  onRowClick?: (row: T) => void;
  activeRowId?: string | null;
  actions?: RowActionDef<T>[];
  actionVariant?: ActionVariant;
  headerActions?: ReactNode;
  searchFields?: (keyof T & string)[];
  /** Callback-based search predicate. OR-combined with searchFields. */
  searchPredicate?: (row: T, query: string) => boolean;
  variant?: TableProps["variant"];
  size?: TableProps["size"];
  density?: TableProps["density"];
  rounded?: TableProps["rounded"];
  className?: string;
  children?: ReactNode;
}

function TreeTable<T>({
  data,
  isLoading,
  tree: treeConfig,
  sort,
  onSortChange,
  onRowClick,
  activeRowId,
  actions,
  actionVariant = "icon",
  headerActions,
  searchFields,
  searchPredicate,
  variant,
  size,
  density,
  rounded,
  className,
  children,
}: TreeTableProps<T>) {
  useTranslation("simplix/ui");
  const { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } = useFlatUIComponents();
  const treeCtx = useCrudTreeContext();

  const config: TreeConfig<T> = useMemo(
    () => ({
      idField: (treeConfig?.idField ?? "id") as keyof T & string,
      childrenField: (treeConfig?.childrenField ?? "children") as keyof T & string,
      parentIdField: treeConfig?.parentIdField,
      initialExpandedDepth: treeConfig?.initialExpandedDepth ?? 1,
    }),
    [treeConfig],
  );

  const { expandedIds, toggleExpand, expandAll, collapseAll } = useTreeExpansion({
    data,
    config,
  });

  // ── Search filtering ──
  const search = treeCtx?.search ?? "";

  const displayData = useMemo(() => {
    if (!search.trim() || (!searchFields?.length && !searchPredicate)) return data;
    const lower = search.toLowerCase();
    return filterTreeWithAncestors(data, (item) => {
      const row = item as Record<string, unknown>;
      const fieldHit = searchFields?.length
        ? searchFields.some((f) => String(row[f] ?? "").toLowerCase().includes(lower))
        : false;
      const customHit = searchPredicate?.(item, lower) ?? false;
      return fieldHit || customHit;
    }, config);
  }, [data, search, searchFields, searchPredicate, config]);

  const searchExpandedIds = useMemo(() => {
    if (!search.trim() || (!searchFields?.length && !searchPredicate)) return null;
    return new Set(getAllNodeIds(displayData, config));
  }, [displayData, search, searchFields, searchPredicate, config]);

  const effectiveExpandedIds = searchExpandedIds ?? expandedIds;

  // Sync expansion state to context for TreeExpandToggle
  // NOTE: Use setExpansion directly (stable reference from useState) instead of treeCtx
  // to avoid infinite render loop: treeCtx changes when expansion state updates → effect re-runs → loop
  const totalNodeCount = useMemo(() => getAllNodeIds(data, config).length, [data, config]);
  const setExpansionCtx = treeCtx?.setExpansion;

  useEffect(() => {
    setExpansionCtx?.({
      expandedCount: expandedIds.size,
      totalCount: totalNodeCount,
      expandAll,
      collapseAll,
    });
  }, [expandedIds.size, totalNodeCount, expandAll, collapseAll, setExpansionCtx]);

  const flatRows = useMemo(
    () => treeToFlat(displayData, effectiveExpandedIds, config),
    [displayData, effectiveExpandedIds, config],
  );

  const idField = config.idField ?? ("id" as keyof T & string);

  const columnDefs = useMemo(() => extractColumnDefs<T>(children), [children]);

  // Register columns to context
  const derivedColumns = useMemo(
    () =>
      columnDefs
        .filter((d): d is ListColumnProps<T> & { field: string } => !!d.field)
        .map((d) => ({ field: d.field, label: d.header ?? d.field })),
    [columnDefs],
  );

  const setColumnsCtx = treeCtx?.setColumns;
  useEffect(() => {
    setColumnsCtx?.(derivedColumns);
  }, [derivedColumns, setColumnsCtx]);

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

  const tanstackColumns = useMemo((): ColumnDef<T & TreeNodeMetadata>[] => {
    const cols: ColumnDef<T & TreeNodeMetadata>[] = [];

    for (let i = 0; i < columnDefs.length; i++) {
      const colDef = columnDefs[i];
      const isFirstCol = i === 0;

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
          const meta = row.original;

          const cellContent = colDef.children
            ? colDef.children({ value, row: row.original })
            : String(value ?? "");

          if (isFirstCol) {
            return (
              <Flex align="center" gap="none" className="min-w-0">
                <span
                  className="shrink-0"
                  style={{ width: meta._treeDepth * 24 }}
                />
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm",
                    meta._hasChildren
                      ? "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      : "text-transparent",
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (meta._hasChildren) {
                      const nodeId = String((meta as Record<string, unknown>)[idField]);
                      toggleExpand(nodeId);
                    }
                  }}
                  tabIndex={meta._hasChildren ? 0 : -1}
                  aria-label={meta._hasChildren ? (meta._isExpanded ? "Collapse" : "Expand") : undefined}
                >
                  {meta._hasChildren ? (
                    meta._isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />
                  ) : (
                    <span className="inline-block h-1 w-1 rounded-full bg-current opacity-30" />
                  )}
                </button>
                <span className="ml-1 truncate">{cellContent}</span>
              </Flex>
            );
          }

          return cellContent;
        },
        size: colDef.width,
      });
    }

    if (actions && actions.length > 0) {
      const colWidth = getActionColumnWidth(actions as RowActionDef<unknown>[], actionVariant);
      cols.push({
        id: "_actions",
        header: () => headerActions ?? "",
        cell: ({ row }) => (
          <RowActionCell row={row.original} actions={actions as RowActionDef<T & TreeNodeMetadata>[]} variant={actionVariant} />
        ),
        size: colWidth,
      });
    } else if (headerActions) {
      cols.push({
        id: "_header_actions",
        header: () => headerActions,
        cell: () => null,
        size: 160,
      });
    }

    return cols;
  }, [columnDefs, sort, handleSortChange, actions, actionVariant, headerActions, idField, toggleExpand]);

  const table = useReactTable({
    data: flatRows,
    columns: tanstackColumns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  return (
    <div className="w-full overflow-x-auto">
      <Table variant={variant} size={size} density={density} rounded={rounded} className={cn("table-auto", className)}>
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
                const rid = String((row.original as Record<string, unknown>)[idField]);
                const isActive = activeRowId != null && rid === activeRowId;
                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      isActive && "bg-muted/50",
                      onRowClick && "cursor-pointer",
                    )}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    data-testid={`tree-row-${rid}`}
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
  );
}

// ── TreeHeaderActions ──

export interface TreeHeaderActionsProps {
  searchPlaceholder?: string;
  className?: string;
}

function TreeHeaderActions({ searchPlaceholder, className }: TreeHeaderActionsProps) {
  const { t } = useTranslation("simplix/ui");
  const { Button, Input, Popover, PopoverContent, PopoverTrigger, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } = useFlatUIComponents();
  const ctx = useCrudTreeContext();
  const expansion = ctx?.expansion;
  const [searchOpen, setSearchOpen] = useState(false);

  const handleClear = () => {
    ctx?.setSearch("");
    setSearchOpen(false);
  };

  return (
    <TooltipProvider>
      <Flex gap="xs" align="center" justify="end" className={className}>
        <Popover open={searchOpen} onOpenChange={(open) => {
          if (!open) ctx?.setSearch("");
          setSearchOpen(open);
        }}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon-xs">
                  <MagnifyingGlassIcon className="size-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>{t("common.search")}</TooltipContent>
          </Tooltip>
          <PopoverContent
            side="left"
            align="center"
            sideOffset={4}
            className="w-auto p-1"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={ctx?.search ?? ""}
                onChange={(e) => ctx?.setSearch(e.target.value)}
                placeholder={searchPlaceholder ?? t("tree.searchPlaceholder")}
                className="h-7 w-44 pl-7 pr-7 text-xs"
                autoFocus
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
          </PopoverContent>
        </Popover>
        {expansion && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-xs" onClick={expansion.expandAll}>
                  <ChevronsUpDownIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("tree.expandAll")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-xs" onClick={expansion.collapseAll}>
                  <ChevronsDownUpIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("tree.collapseAll")}</TooltipContent>
            </Tooltip>
          </>
        )}
      </Flex>
    </TooltipProvider>
  );
}

// ── TreeEmpty ──

export interface TreeEmptyProps {
  reason?: EmptyReason;
  messages?: Partial<Record<EmptyReason, string>>;
  className?: string;
  children?: ReactNode | ((props: { reason: EmptyReason }) => ReactNode);
}

function TreeEmpty({ reason = "no-data", messages, className, children }: TreeEmptyProps) {
  const { t } = useTranslation("simplix/ui");
  const defaultMessages: Record<EmptyReason, string> = {
    "no-data": t("list.noData"),
    "no-filter": t("list.noFilter"),
    "no-search": t("list.noSearch"),
    "error": t("list.error"),
  };
  const mergedMessages = messages ? { ...defaultMessages, ...messages } : defaultMessages;
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
 * Compound component for building hierarchical tree views with
 * expand/collapse, search filtering, sorting, and row actions.
 *
 * ```
 * ┌─────────────────────────────────────────┐
 * │ <CrudTree.Toolbar>                      │
 * │   <CrudTree.Search />                   │
 * │   <CrudTree.ExpandToggle />             │
 * │ </CrudTree.Toolbar>                     │
 * │ <CrudTree.Table data={nodes} tree={..}> │
 * │   <CrudTree.Column field="name" ... />  │
 * │ </CrudTree.Table>                       │
 * └─────────────────────────────────────────┘
 * ```
 *
 * Sub-components: Toolbar, Search, ExpandToggle, HeaderActions,
 * Table, Column, Empty.
 */
export const CrudTree = Object.assign(TreeRoot, {
  Toolbar: TreeToolbar,
  Search: TreeSearch,
  ExpandToggle: TreeExpandToggle,
  HeaderActions: TreeHeaderActions,
  Table: TreeTable,
  Column: TreeColumn,
  Empty: TreeEmpty,
});
