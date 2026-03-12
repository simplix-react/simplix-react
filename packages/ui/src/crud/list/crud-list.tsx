import {useTranslation} from "@simplix-react/i18n/react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {createElement, type ReactNode, useCallback, useEffect, useMemo, useRef, useState,} from "react";

import {
  Badge,
  type BadgeVariants,
  BooleanBadge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  type TableProps,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "../../base";
import {Flex, Stack} from "../../primitives";
import {cn} from "../../utils/cn";
import {formatDateMedium, formatDateTime, formatRelativeTime} from "../../utils/format-date";
import type {ColumnInfo, EmptyReason, SortState} from "../shared";
import {CrudListColumnContext, useCrudListColumns} from "../shared";
import {EmptyState} from "../shared/empty-state";
import {AlertTriangleIcon, ArrowUpDownIcon, EyeIcon, FolderTreeIcon, FunnelIcon, MagnifyingGlassIcon, MapPinIcon, PencilIcon, PlusIcon, TrashIcon, UnlinkIcon} from "../shared/icons";
import {
  AdvancedSelectFilter,
  AdvancedTextFilter,
  ChipFilter,
  DateFilter,
  DateRangeFilter,
  FacetedFilter,
  FilterActions,
  FilterBar,
  MultiTextFilter,
  NumberFilter,
  TextFilter,
  ToggleFilter,
  UnifiedTextFilter,
} from "../filters";
import { closestCenter, DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ReorderConfig } from "../shared";
import { useReorder } from "../reorder/use-reorder";
import { DragHandleHeader } from "../reorder/drag-handle";
import { DraggableRow } from "../reorder/draggable-row";
import { DraggableCard } from "../reorder/draggable-card";
import {useContainerWidth} from "./use-container-width";

// ── Empty Reason Card ──

const emptyReasonConfig = {
  error: { icon: <AlertTriangleIcon />, iconClassName: "bg-destructive/10 text-destructive", titleKey: "list.errorTitle", descKey: "list.errorDescription" },
  "no-filter": { icon: <FunnelIcon />, iconClassName: "bg-muted text-muted-foreground", titleKey: "list.noFilterTitle", descKey: "list.noFilter" },
  "no-search": { icon: <MagnifyingGlassIcon />, iconClassName: "bg-muted text-muted-foreground", titleKey: "list.noSearchTitle", descKey: "list.noSearch" },
} as const;

function EmptyReasonCard({ reason }: { reason: Exclude<EmptyReason, "no-data"> }) {
  const { t } = useTranslation("simplix/ui");
  const config = emptyReasonConfig[reason];
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border px-6 py-16 text-center">
      <div className={`mb-3 rounded-full p-4 [&_svg]:size-8 ${config.iconClassName}`}>
        {config.icon}
      </div>
      <p className="text-base font-semibold">{t(config.titleKey)}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{t(config.descKey)}</p>
    </div>
  );
}

// ── List Root ──

/**
 * Props for the {@link CrudList} compound component root.
 *
 * @example
 * ```tsx
 * <CrudList>
 *   <CrudList.Toolbar>...</CrudList.Toolbar>
 *   <CrudList.Table data={items}>...</CrudList.Table>
 *   <CrudList.Pagination ... />
 * </CrudList>
 * ```
 */
export interface ListProps {
  className?: string;
  children?: ReactNode;
}

function ListRoot({ className, children }: ListProps) {
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [isCardMode, setIsCardMode] = useState(false);

  const columnCtx = useMemo(
    () => ({ columns, setColumns, hiddenColumns, setHiddenColumns, isCardMode, setIsCardMode }),
    [columns, hiddenColumns, isCardMode],
  );

  return (
    <CrudListColumnContext.Provider value={columnCtx}>
      <Stack
        gap="sm"
        className={cn("w-full", className)}
        data-testid="crud-list"
      >
        {children}
      </Stack>
    </CrudListColumnContext.Provider>
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
      className={cn("w-full rounded-lg border bg-card p-3 [&>*]:grow", className)}
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

function ListSearch({ value, onChange, placeholder, className }: ListSearchProps) {
  const { t } = useTranslation("simplix/ui");
  return (
    <Input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? t("list.searchPlaceholder")}
      className={cn("max-w-xs", className)}
    />
  );
}

// ── List.Filter ──

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
  display?: "badge" | "boolean";
  format?: "date" | "datetime" | "relative";
  variants?: Record<string, BadgeVariants["variant"]>;
  children?: (props: { value: unknown; row: T }) => ReactNode;
}

// ListColumn is not rendered directly; it's used for declaration.
function ListColumn<T>(_props: ListColumnProps<T>): ReactNode {
  return null;
}

// ── Format helpers ──

/**
 * Resolve enum-like objects to their plain value.
 * Boot API returns enums as `{ type, value, label }` objects.
 * This extracts `.value` so rendering/formatting works correctly.
 */
function resolveValue(value: unknown): unknown {
  if (typeof value === "object" && value !== null && "value" in value && "type" in value) {
    return (value as { value: unknown }).value;
  }
  return value;
}

function formatCellValue(value: unknown, format?: "date" | "datetime" | "relative", locale?: string): string {
  if (value == null) return "";
  if (!format) return String(value);

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  if (format === "date") return formatDateMedium(date, locale);
  if (format === "datetime") return formatDateTime(date, locale);
  return formatRelativeTime(date, locale);
}

// ── Action types ──

export type ActionType = "view" | "edit" | "delete" | "locate" | "add-child" | "reorder" | "move" | "unlink";
export type ActionVariant = "outline" | "ghost" | "icon";

export interface RowActionDef<T> {
  type: ActionType;
  onClick: (row: T) => void;
  label?: string;
  icon?: ReactNode;
  when?: (row: T) => boolean;
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
  /** Render prop for the card title area. Displayed with a bottom border, inline with action buttons. */
  cardTitle?: (props: { row: T; index: number }) => ReactNode;
  /** Render prop for the card content area below the title. */
  cardContent?: (props: { row: T; index: number }) => ReactNode;
  /** Table visual variant. */
  variant?: TableProps["variant"];
  /** Cell padding size. */
  size?: TableProps["size"];
  /** Vertical density (padding). Overrides size-based vertical spacing when set. */
  density?: TableProps["density"];
  /** Container border radius. */
  rounded?: TableProps["rounded"];
  /** Declarative row action buttons. Automatically appends an action column to the table. */
  actions?: RowActionDef<T>[];
  /** Visual variant for action buttons. Defaults to `"outline"`. */
  actionVariant?: ActionVariant;
  /** Override the auto-calculated action column width (px). */
  actionColumnWidth?: number;
  /** Drag-and-drop row reorder configuration. */
  reorder?: ReorderConfig<T>;
  /** When set, displays an empty-state message inside the table body. */
  emptyReason?: EmptyReason | null;
  /** Rich empty state config for "no-data" reason. Replaces the entire table with a centered illustration. */
  emptyState?: {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
  };
  /** Callback to compute extra class names for each table/card row. */
  rowClassName?: (row: T) => string | undefined;
  className?: string;
  children?: ReactNode;
}

// ── Default action config ──

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
              const icon = action.icon ?? ACTION_ICONS[action.type];
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

  // outline / ghost variant
  return (
    <Flex gap="xs" justify="end">
      {visible.map((action) => {
        const label = action.label ?? t(ACTION_LABEL_KEYS[action.type]);
        const icon = action.icon ?? ACTION_ICONS[action.type];
        return (
          <Button
            key={action.type}
            size="sm"
            variant={variant}
            onClick={(e) => handleClick(e, action)}
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

// ── Reorderable Table (DndContext wraps Table to avoid <div> inside <table>) ──

interface ReorderableTableProps<T> {
  reorderConfig: ReorderConfig<T>;
  data: T[];
  sort: SortState | null;
  onSortChange?: (sort: SortState) => void;
  table: ReturnType<typeof useReactTable<T>>;
  rowId?: (row: T) => string;
  activeRowId?: string | null;
  selectedIndices?: Set<number>;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyReason?: EmptyReason | null;
  emptyState?: ListTableProps<T>["emptyState"];
  variant?: TableProps["variant"];
  size?: TableProps["size"];
  density?: TableProps["density"];
  rounded?: TableProps["rounded"];
  className?: string;
}

function ReorderableTable<T>({
  reorderConfig,
  data,
  sort,
  onSortChange,
  table,
  rowId: rowIdFn,
  activeRowId,
  selectedIndices,
  onRowClick,
  isLoading,
  emptyReason,
  emptyState,
  variant,
  size,
  density,
  rounded,
  className,
}: ReorderableTableProps<T>) {
  const { t } = useTranslation("simplix/ui");
  const emptyMessages: Record<EmptyReason, string> = {
    "no-data": t("list.noData"),
    "no-filter": t("list.noFilter"),
    "no-search": t("list.noSearch"),
    "error": t("list.error"),
  };
  const {
    sensors,
    handleDragStart,
    handleDragEnd,
    isDragEnabled,
    getRowId: dndGetRowId,
    optimisticData,
  } = useReorder({ config: reorderConfig, data, sort, onSortChange });

  const sortableIds = useMemo(
    () => optimisticData.map((row) => dndGetRowId(row)),
    [optimisticData, dndGetRowId],
  );

  // Reorder tanstack rows to match optimistic order
  const orderedRows = useMemo(() => {
    const rows = table.getRowModel().rows;
    if (optimisticData === data) return rows;
    const idOrder = new Map(sortableIds.map((id, i) => [id, i]));
    return [...rows].sort((a, b) => {
      const ai = idOrder.get(dndGetRowId(a.original)) ?? 0;
      const bi = idOrder.get(dndGetRowId(b.original)) ?? 0;
      return ai - bi;
    });
  }, [table, optimisticData, data, sortableIds, dndGetRowId]);

  const tableHeader = (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          <TableHead className="w-10 px-2" style={{ width: 40 }}>
            <DragHandleHeader
              isDragEnabled={isDragEnabled}
              onActivate={() => onSortChange?.({ field: reorderConfig.orderField, direction: "asc" })}
            />
          </TableHead>
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
  );

  if (isLoading && data.length === 0) {
    return (
      <Table variant={variant} size={size} density={density} rounded={rounded} className={cn("table-auto", className)}>
        {tableHeader}
        <TableBody>
          {Array.from({ length: 5 }, (_, i) => (
            <TableRow key={`skeleton-${i}`}>
              <TableCell><Skeleton className="h-4 w-4" /></TableCell>
              {table.getAllColumns().map((col) => (
                <TableCell key={col.id}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (emptyReason && data.length === 0) {
    if (emptyReason === "no-data" && emptyState) {
      return <EmptyState {...emptyState} />;
    }
    if (emptyReason !== "no-data") {
      return <EmptyReasonCard reason={emptyReason} />;
    }
    return (
      <div className="flex h-24 items-center justify-center rounded-lg border text-sm text-muted-foreground">
        {emptyMessages[emptyReason]}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Table variant={variant} size={size} density={density} rounded={rounded} className={cn("table-auto", className)}>
        {tableHeader}
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          <TableBody>
            {orderedRows.map((row) => {
              const rid = rowIdFn?.(row.original) ?? row.id;
              const dndId = dndGetRowId(row.original);
              const isActive = activeRowId != null && rid === activeRowId;
              return (
                <DraggableRow
                  key={row.id}
                  row={row}
                  rowId={dndId}
                  isActive={isActive}
                  isSelected={selectedIndices?.has(row.index)}
                  isDragEnabled={isDragEnabled}
                  reorderConfig={reorderConfig}
                  onRowClick={onRowClick}
                />
              );
            })}
          </TableBody>
        </SortableContext>
      </Table>
    </DndContext>
  );
}

// ── Reorderable Card List ──

type CardDensity = "compact" | "default" | "comfortable";

const cardDensityPadding: Record<CardDensity, string> = {
  compact: "px-3 py-2",
  default: "px-4 py-3",
  comfortable: "px-5 py-4",
};

interface ReorderableCardListProps<T> {
  reorderConfig: ReorderConfig<T>;
  data: T[];
  sort: SortState | null;
  onSortChange?: (sort: SortState) => void;
  rowId?: (row: T) => string;
  activeRowId?: string | null;
  selectable?: boolean;
  selectedIndices?: Set<number>;
  onSelectionChange?: (index: number) => void;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyReason?: EmptyReason | null;
  emptyState?: ListTableProps<T>["emptyState"];
  density?: CardDensity;
  actions?: RowActionDef<T>[];
  actionVariant?: ActionVariant;
  cardTitle: (props: { row: T; index: number }) => ReactNode;
  cardContent: (props: { row: T; index: number }) => ReactNode;
}

function ReorderableCardList<T>({
  reorderConfig,
  data,
  sort,
  onSortChange,
  rowId: rowIdFn,
  activeRowId,
  selectable,
  selectedIndices,
  onSelectionChange,
  onRowClick,
  isLoading,
  emptyReason,
  emptyState,
  density = "default",
  actions,
  actionVariant = "icon",
  cardTitle,
  cardContent,
}: ReorderableCardListProps<T>) {
  const { t } = useTranslation("simplix/ui");
  const emptyMessages: Record<EmptyReason, string> = {
    "no-data": t("list.noData"),
    "no-filter": t("list.noFilter"),
    "no-search": t("list.noSearch"),
    "error": t("list.error"),
  };
  const {
    sensors,
    handleDragStart,
    handleDragEnd,
    isDragEnabled,
    getRowId: dndGetRowId,
    optimisticData,
  } = useReorder({ config: reorderConfig, data, sort, onSortChange });

  const sortableIds = useMemo(
    () => optimisticData.map((row) => dndGetRowId(row)),
    [optimisticData, dndGetRowId],
  );

  const skeletonPadding = cardDensityPadding[density];

  if (isLoading && data.length === 0) {
    return (
      <Stack gap="sm">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={`card-skeleton-${i}`} className={cn("rounded-lg border", skeletonPadding)}>
            <Stack gap="xs">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </Stack>
          </div>
        ))}
      </Stack>
    );
  }

  if (emptyReason && data.length === 0) {
    if (emptyReason === "no-data" && emptyState) {
      return <EmptyState {...emptyState} />;
    }
    if (emptyReason !== "no-data") {
      return <EmptyReasonCard reason={emptyReason} />;
    }
    return (
      <div className="flex h-24 items-center justify-center rounded-lg border text-sm text-muted-foreground">
        {emptyMessages[emptyReason]}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <Stack gap="sm">
          {optimisticData.map((row, index) => {
            const rid = rowIdFn?.(row) ?? String(index);
            const dndId = dndGetRowId(row);
            const isActive = activeRowId != null && rid === activeRowId;
            return (
              <DraggableCard
                key={dndId}
                row={row}
                rowId={dndId}
                index={index}
                isActive={isActive}
                isSelected={selectedIndices?.has(index)}
                isDragEnabled={isDragEnabled}
                reorderConfig={reorderConfig}
                selectable={selectable}
                density={density}
                onRowClick={onRowClick}
                onSelectionChange={onSelectionChange}
                cardActions={actions && actions.length > 0 ? <RowActionCell row={row} actions={actions} variant={actionVariant} /> : undefined}
                cardTitle={createElement(cardTitle, { row, index })}
                cardContent={createElement(cardContent, { row, index })}
              />
            );
          })}
        </Stack>
      </SortableContext>
    </DndContext>
  );
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
  cardTitle,
  cardContent,
  variant,
  size,
  density,
  rounded,
  actions,
  actionVariant = "icon",
  actionColumnWidth: actionColumnWidthOverride,
  reorder,
  emptyReason,
  emptyState,
  rowClassName,
  className,
  children,
}: ListTableProps<T>) {
  const { t, locale } = useTranslation("simplix/ui");
  const emptyMessages: Record<EmptyReason, string> = {
    "no-data": t("list.noData"),
    "no-filter": t("list.noFilter"),
    "no-search": t("list.noSearch"),
    "error": t("list.error"),
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);
  const hasCard = !!(cardTitle || cardContent);
  const isCardMode = !!(
    cardBreakpoint &&
    hasCard &&
    containerWidth > 0 &&
    containerWidth < cardBreakpoint
  );

  const columnCtx = useCrudListColumns();

  // Sync card mode to context so FilterBar can hide column toggle
  useEffect(() => {
    columnCtx?.setIsCardMode(isCardMode);
  }, [isCardMode, columnCtx?.setIsCardMode]);
  const columnDefs = useMemo(() => extractColumnDefs<T>(children), [children]);

  // Register columns to context for FilterBar's Columns dropdown
  const derivedColumns = useMemo(
    () => columnDefs
      .filter((d): d is ListColumnProps<T> & { field: string } => !!d.field)
      .map((d) => ({ field: d.field, label: d.header ?? d.field })),
    [columnDefs],
  );

  useEffect(() => {
    columnCtx?.setColumns(derivedColumns);
  }, [derivedColumns, columnCtx?.setColumns]);

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
          const raw = getValue();
          const value = resolveValue(raw);

          // Custom render prop (pass raw for full access)
          if (colDef.children) {
            return colDef.children({ value: raw, row: row.original });
          }

          // Badge display
          if (colDef.display === "badge" && colDef.variants) {
            const strVal = String(value ?? "");
            const variant = colDef.variants[strVal] ?? "default";
            return <Badge variant={variant}>{strVal}</Badge>;
          }

          // Boolean display
          if (colDef.display === "boolean") {
            return <BooleanBadge value={!!value} />;
          }

          // Format
          return formatCellValue(value, colDef.format, locale);
        },
        size: colDef.width,
      });
    }

    if (actions && actions.length > 0) {
      const colWidth = actionColumnWidthOverride ?? getActionColumnWidth(actions as RowActionDef<unknown>[], actionVariant);
      cols.push({
        id: "_actions",
        header: () => "",
        cell: ({ row }) => (
          <RowActionCell row={row.original} actions={actions} variant={actionVariant} />
        ),
        size: colWidth,
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
    actions,
    actionVariant,
    actionColumnWidthOverride,
  ]);

  const columnVisibility: VisibilityState = useMemo(() => {
    const hidden = columnCtx?.hiddenColumns;
    if (!hidden?.size) return {};
    const vis: VisibilityState = {};
    for (const field of hidden) vis[field] = false;
    return vis;
  }, [columnCtx?.hiddenColumns]);

  const table = useReactTable({
    data,
    columns: tanstackColumns,
    state: { sorting, columnVisibility },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  // Empty states — replace the entire table/card area
  if (emptyReason && data.length === 0 && !isLoading) {
    if (emptyReason === "no-data" && emptyState) {
      return (
        <div ref={containerRef} className="w-full">
          <EmptyState {...emptyState} />
        </div>
      );
    }
    if (emptyReason !== "no-data") {
      return (
        <div ref={containerRef} className="w-full">
          <EmptyReasonCard reason={emptyReason} />
        </div>
      );
    }
  }

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
                  {t("list.selectAll")}
                </label>
              </Flex>
            )}
            {reorder && hasCard ? (
              <ReorderableCardList
                reorderConfig={reorder}
                data={data}
                sort={sort ?? null}
                onSortChange={onSortChange}
                rowId={rowId}
                activeRowId={activeRowId}
                selectable={selectable}
                selectedIndices={selectedIndices}
                onSelectionChange={onSelectionChange}
                onRowClick={onRowClick}
                isLoading={isLoading}
                emptyReason={emptyReason}
                emptyState={emptyState}
                density={density}
                actions={actions}
                actionVariant={actionVariant}
                cardTitle={cardTitle ?? (() => null)}
                cardContent={cardContent ?? (() => null)}
              />
            ) : isLoading && data.length === 0
              ? Array.from({ length: 3 }, (_, i) => (
                  <div key={`card-skeleton-${i}`} className={cn("rounded-lg border", cardDensityPadding[density ?? "default"])}>
                    <Stack gap="xs">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </Stack>
                  </div>
                ))
              : emptyReason && data.length === 0
                ? <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">{emptyMessages[emptyReason]}</div>
              : data.map((row, index) => {
                  const rid = rowId?.(row) ?? String(index);
                  const isSelected = selectedIndices?.has(index);
                  const isActive = activeRowId != null && rid === activeRowId;
                  return (
                    <div
                      key={rid}
                      className={cn(
                        "relative rounded-lg border transition-colors hover:bg-muted/50",
                        isSelected && "ring-2 ring-primary",
                        isActive && "bg-muted/50",
                        onRowClick && "cursor-pointer",
                        rowClassName?.(row),
                      )}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      data-testid={`list-row-${rid}`}
                    >
                      {cardTitle && (
                        <Flex align="center" justify="between" className={cn("border-b px-2 py-1.5")}>
                          <div className="min-w-0 flex-1">{createElement(cardTitle, { row, index })}</div>
                          <Flex gap="xs" align="center" className="shrink-0 ml-2">
                            {actions && actions.length > 0 && (
                              <RowActionCell row={row} actions={actions} variant={actionVariant} />
                            )}
                            {selectable && (
                              <input
                                type="checkbox"
                                checked={isSelected ?? false}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  onSelectionChange?.(index);
                                }}
                                className="h-4 w-4 rounded border-gray-300"
                                aria-label={`Select row ${index + 1}`}
                              />
                            )}
                          </Flex>
                        </Flex>
                      )}
                      {cardContent && (
                        <div className={cn(cardDensityPadding[density ?? "default"], cardTitle && "pt-2")}>
                          {createElement(cardContent, { row, index })}
                        </div>
                      )}
                    </div>
                  );
                })}
          </Stack>
        </div>
      ) : (
        <div key="table" className="animate-in fade-in-0 duration-200">
          {reorder ? (
            <ReorderableTable
              reorderConfig={reorder}
              data={data}
              sort={sort ?? null}
              onSortChange={onSortChange}
              table={table}
              rowId={rowId}
              activeRowId={activeRowId}
              selectedIndices={selectedIndices}
              onRowClick={onRowClick}
              isLoading={isLoading}
              emptyReason={emptyReason}
              emptyState={emptyState}
              variant={variant}
              size={size}
              density={density}
              rounded={rounded}
              className={className}
            />
          ) : (
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
                  : emptyReason && data.length === 0
                    ? <TableRow><TableCell colSpan={table.getAllColumns().length} className="h-24 text-center text-muted-foreground">{emptyMessages[emptyReason]}</TableCell></TableRow>
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
                            rowClassName?.(row.original),
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
          )}
        </div>
      )}
    </div>
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
  /** Label for page-size selector. Defaults to `"Rows:"`. */
  rowsLabel?: string;
  /** Breakpoint (px) below which the compact variant is used. Defaults to `640`. */
  compactBreakpoint?: number;
  className?: string;
}

/**
 * Build the page numbers to display, with ellipsis for gaps.
 * Always shows first, last, and a window around the current page.
 */
function getPageNumbers(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (page > 3) pages.push("ellipsis");

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (page < totalPages - 2) pages.push("ellipsis");

  pages.push(totalPages);
  return pages;
}

function ListPagination({
  page,
  pageSize,
  total: _total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  rowsLabel,
  compactBreakpoint = 640,
  className,
}: ListPaginationProps) {
  const { t } = useTranslation("simplix/ui");
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);
  const isCompact = containerWidth > 0 && containerWidth < compactBreakpoint;
  const pageSizeSelector = onPageSizeChange && (
    <Flex gap="xs" align="center">
      <span className="text-xs text-muted-foreground">{rowsLabel ?? t("list.rows")}</span>
      <Select
        value={String(pageSize)}
        onValueChange={(v) => onPageSizeChange(Number(v))}
      >
        <SelectTrigger className="h-6 w-[54px] text-xs" aria-label="Page size">
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
  );

  const prevButton = (
    <button
      type="button"
      disabled={page <= 1}
      onClick={() => onPageChange(page - 1)}
      className="inline-flex h-6 w-6 items-center justify-center rounded border text-xs disabled:opacity-50"
      aria-label="Previous page"
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  const nextButton = (
    <button
      type="button"
      disabled={page >= totalPages}
      onClick={() => onPageChange(page + 1)}
      className="inline-flex h-6 w-6 items-center justify-center rounded border text-xs disabled:opacity-50"
      aria-label="Next page"
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  const pageNumbers = isCompact ? null : getPageNumbers(page, totalPages);

  return (
    <div ref={containerRef} className={cn("flex w-full items-center justify-end", className)}>
      <Flex gap="sm" align="center">
        {pageSizeSelector}
        <Flex gap="xs" align="center">
        {prevButton}
        {isCompact ? (
          <span className="text-xs">{page} / {totalPages}</span>
        ) : (
          pageNumbers!.map((p, i) =>
            p === "ellipsis" ? (
              <span key={`ellipsis-${i}`} className="inline-flex h-6 w-6 items-center justify-center text-xs text-muted-foreground">
                &hellip;
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded text-xs font-medium",
                  p === page
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                )}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            ),
          )
        )}
        {nextButton}
        </Flex>
      </Flex>
    </div>
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

function ListBulkActions({ selectedCount, onClear, selectedLabel, clearLabel, className, children }: ListBulkActionsProps) {
  const { t } = useTranslation("simplix/ui");
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
        {selectedLabel ? selectedLabel(selectedCount) : t("list.selected", { count: selectedCount })}
      </span>
      {children}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="ml-auto text-sm text-muted-foreground hover:text-foreground"
        >
          {clearLabel ?? t("common.clear")}
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

function ListEmpty({ reason = "no-data", messages, className, children }: ListEmptyProps) {
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
 * Compound component for building CRUD list views with toolbar, table,
 * pagination, selection, and bulk actions.
 *
 * ```
 * ┌─────────────────────────────────────────┐
 * │ Toolbar                                 │
 * │ [Search...]   [Filter ▼]   [+ Create]   │
 * ├─────┬────────┬────────┬────────┬────────┤
 * │ [x] │ Name   │ Status │ Date   │ Action │
 * ├─────┼────────┼────────┼────────┼────────┤
 * │ [ ] │ Item A │ Active │ 01-01  │ [Edit] │
 * │ [x] │ Item B │ Draft  │ 01-02  │ [Edit] │
 * ├─────┴────────┴────────┴────────┴────────┤
 * │ BulkActions: 1 selected  [Delete]       │
 * ├─────────────────────────────────────────┤
 * │          Pagination < 1  2  3 >         │
 * └─────────────────────────────────────────┘
 * ```
 *
 * Sub-components: Toolbar, Search, Table, Column, Pagination,
 * BulkActions, BulkAction, Empty, and 10+ filter types.
 */
export const CrudList = Object.assign(ListRoot, {
  Toolbar: ListToolbar,
  Search: ListSearch,
  // Filter components (10 types + actions)
  TextFilter,
  MultiTextFilter,
  AdvancedTextFilter,
  UnifiedTextFilter,
  NumberFilter,
  DateFilter,
  DateRangeFilter,
  FacetedFilter,
  AdvancedSelectFilter,
  ToggleFilter,
  ChipFilter,
  FilterActions,
  FilterBar,
  // Core components
  Table: ListTable,
  Column: ListColumn,
  Pagination: ListPagination,
  BulkActions: ListBulkActions,
  BulkAction: ListBulkAction,
  Empty: ListEmpty,
});
