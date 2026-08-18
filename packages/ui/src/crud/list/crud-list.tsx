import {useTranslation} from "@simplix-react/i18n/react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {createElement, Fragment, type ReactNode, type Ref, useCallback, useEffect, useMemo, useRef, useState,} from "react";

import {
  type BadgeVariants,
  BooleanBadge,
  type TableProps,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../base";
import {ColumnResizeHandle} from "./column-resize-handle";
import {
  type ColumnWidths,
  readColumnWidths,
  sizedCellProps,
  sizedHeaderStyle,
  writeColumnWidths,
} from "./column-widths";
import {useFlatUIComponents} from "../../provider/ui-provider";
import {useUIDefaults} from "../../provider/ui-defaults-context";
import {Flex, Stack} from "../../primitives";
import {cn} from "../../utils/cn";
import {formatDateMedium, formatDateTime, formatRelativeTime} from "../../utils/format-date";
import {formatWallClockTime} from "../../utils/rfc3339-date";
import {parseDate} from "../../utils/parse-date";
import type {ColumnInfo, EmptyReason, SortState} from "../shared";
import {
  CrudListColumnContext,
  rowClickHandler,
  rowClickIgnoreForColumn,
  rowClickIgnoreProps,
  useCrudListColumns,
  useDefaultDisplayZone,
} from "../shared";
import type {CrudListViewMode} from "../shared";
import {EmptyState} from "../shared/empty-state";
import {TableCardFrame, useTableCardFrame} from "../shared/table-card-frame";
import { CountryCell, PhoneCell } from "./cells";
import {AlertTriangleIcon, CloudOffIcon, FunnelIcon, MagnifyingGlassIcon} from "../shared/icons";
import {getActionColumnWidth, RowActionCell, type ActionVariant, type RowActionDef} from "../shared/row-actions";
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
import { useReorder, DragHandleHeader, DraggableRow, DraggableCard } from "../reorder";
import {useContainerWidth} from "./use-container-width";

// ── Table Card frame context ──
//
// Set by CrudList.TableCard (via the shared TableCardFrame) so List.Table and
// List.Pagination know they render inside one bordered card: the table becomes
// the scroll region with a sticky header, and the pager becomes the card footer.
// The frame primitive is shared with CrudTree.TableCard — see ../shared/table-card-frame.

// ── Empty Reason Card ──

const emptyReasonConfig = {
  error: { icon: <AlertTriangleIcon />, iconClassName: "bg-destructive/10 text-destructive", titleKey: "list.errorTitle", descKey: "list.errorDescription" },
  unavailable: { icon: <CloudOffIcon />, iconClassName: "bg-destructive/10 text-destructive", titleKey: "list.unavailableTitle", descKey: "list.unavailableDescription" },
  "no-filter": { icon: <FunnelIcon />, iconClassName: "bg-muted text-muted-foreground", titleKey: "list.noFilterTitle", descKey: "list.noFilter" },
  "no-search": { icon: <MagnifyingGlassIcon />, iconClassName: "bg-muted text-muted-foreground", titleKey: "list.noSearchTitle", descKey: "list.noSearch" },
} as const;

function EmptyReasonCard({ reason, bordered = true }: { reason: Exclude<EmptyReason, "no-data">; bordered?: boolean }) {
  const { t } = useTranslation("simplix/ui");
  const config = emptyReasonConfig[reason];
  return (
    <div className={cn("flex min-h-[280px] flex-col items-center justify-center px-6 py-16 text-center", bordered && "rounded-lg border")}>
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
  /**
   * The list's own outermost element.
   *
   * <p>What a screen measures when its column set depends on how much room the list actually has —
   * which is not how much the window has, because a detail panel takes most of it. Pair with
   * `useContainerWidth`.
   */
  ref?: Ref<HTMLDivElement>;
}

function ListRoot({ className, children, ref }: ListProps) {
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [isCardMode, setIsCardMode] = useState(false);
  const [viewMode, setViewMode] = useState<CrudListViewMode>("list");
  const [canGridView, setCanGridView] = useState(false);
  const [responsiveCardMode, setResponsiveCardMode] = useState(false);

  const columnCtx = useMemo(
    () => ({
      columns, setColumns, hiddenColumns, setHiddenColumns, isCardMode, setIsCardMode,
      viewMode, setViewMode, canGridView, setCanGridView, responsiveCardMode, setResponsiveCardMode,
    }),
    [columns, hiddenColumns, isCardMode, viewMode, canGridView, responsiveCardMode],
  );

  return (
    <CrudListColumnContext.Provider value={columnCtx}>
      <Stack
        ref={ref}
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

// ── List.TableCard ──

/** Props for the List.TableCard wrapper. */
export interface ListTableCardProps {
  /** Bounds the table body height so it scrolls while the header sticks. Works in any layout. */
  maxHeight?: number | string;
  /** Fills a height-bounded flex parent instead of using `maxHeight` (e.g. list-detail pane). */
  fill?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Wraps `List.Table` + `List.Pagination` in one bordered card: the table is a
 * scroll region with a sticky header and the pager docks as the footer.
 * Opt-in — without it, Table and Pagination render as before.
 *
 * ```tsx
 * <CrudList.TableCard maxHeight={520}>
 *   <CrudList.Table ... />
 *   <CrudList.Pagination ... />
 * </CrudList.TableCard>
 * ```
 */
function ListTableCard({ maxHeight, fill, className, children }: ListTableCardProps) {
  return (
    <TableCardFrame maxHeight={maxHeight} fill={fill} className={className}>
      {children}
    </TableCardFrame>
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
  const { Input } = useFlatUIComponents();
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
  // Single chevron: faint (sortable hint) when inactive, solid up/down when sorted.
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("ml-1 inline-block shrink-0", direction ? "opacity-100" : "opacity-30")}
      aria-hidden="true"
    >
      {direction === "asc" ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
    </svg>
  );
}

// ── List.Column (definition, not rendered directly) ──

/** Declarative column definition for List.Table. Not rendered directly. */
export interface ListColumnProps<T> {
  field?: keyof T & string;
  header?: string;
  sortable?: boolean;
  /**
   * Column content width in pixels. Also sizes the header box, so a header
   * longer than the width ellipsizes (full text in a tooltip) instead of
   * stretching the column. The cell's horizontal padding sits outside this
   * width, and on a sortable column the sort icon shares it with the label.
   */
  width?: number;
  /**
   * The column's floor in pixels, rather than its whole allowance: it never
   * renders narrower than this, and it takes a share of whatever width the
   * table has left over. The cell stops contributing its own content to the
   * table's intrinsic width, so long values ellipsize instead of widening the
   * column, and a table with room to spare spends that room here.
   *
   * Use this where the value is free text of unpredictable length — a summary,
   * a target, a description. Use {@link width} instead where the column holds
   * something of known size and extra room would only be padding.
   *
   * The cell's own content must fill the cell for the extra width to be
   * visible: render it as a block that truncates (`className="block truncate"`)
   * and give it no width of its own. Ignored when {@link width} is also set.
   */
  minWidth?: number;
  display?: "badge" | "boolean" | "country" | "phone";
  format?: "date" | "datetime" | "time" | "relative";
  /**
   * IANA display zone for `format="datetime"` cells. A string applies one zone to
   * every row (a screen pinned to one site); a function resolves the zone per row
   * (mixed-site lists, e.g. `(row) => zoneOf(row.siteId)`). Returning `undefined`
   * falls back to the browser zone. Ignored by `date` / `time` / `relative`
   * formats — those are zone-neutral by kind.
   */
  displayZone?: string | ((row: T) => string | undefined);
  variants?: Record<string, BadgeVariants["variant"]>;
  /**
   * Enum this column's values belong to, e.g. `"OrderStatus"`. Paired with
   * `enumLabel`, a `display="badge"` cell shows the translated label instead of
   * the constant the API sends.
   */
  enumName?: string;
  /**
   * Translates an enum constant — pass the entity translation's `enumLabel`.
   * Without it (or without `enumName`) the badge falls back to the raw value,
   * which is a constant like `IN_TRANSIT` rather than anything an operator reads.
   */
  enumLabel?: (enumName: string, value: string) => string;
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

function formatCellValue(
  value: unknown,
  format?: "date" | "datetime" | "time" | "relative",
  locale?: string,
  timeZone?: string,
): string {
  if (value == null) return "";
  if (!format) return String(value);

  // Wall-clock columns (format="time") hold an HH:mm[:ss] LocalTime string with no
  // calendar day, so they never go through Date parsing.
  if (format === "time") return formatWallClockTime(String(value), locale) ?? String(value);

  // Date-only columns (format="date") parse the LocalDate string as a local
  // calendar date (parseDate), avoiding new Date("2026-07-06")'s UTC-midnight
  // shift that renders the previous day west of UTC. datetime/relative keep
  // UTC/offset-aware parsing for real timestamps.
  const date =
    format === "date"
      ? (value instanceof Date ? value : parseDate(String(value)))
      : (value instanceof Date ? value : new Date(String(value)));
  if (!date || Number.isNaN(date.getTime())) return String(value);

  if (format === "date") return formatDateMedium(date, locale);
  // timeZone applies to absolute instants only; date/time/relative are zone-neutral.
  if (format === "datetime") return formatDateTime(date, locale, timeZone);
  return formatRelativeTime(date, locale);
}

// ── Action types ──

export type { ActionType, ActionVariant, RowActionDef } from "../shared/row-actions";

// ── List.Table ──

/**
 * Per-instance render overrides for List.Table seams. Each slot replaces the
 * default rendering for that seam; omitted slots keep the built-in behavior.
 */
export interface ListTableSlots<T> {
  /** Replace the per-row action cluster. Receives the row. */
  rowActions?: (ctx: { row: T }) => ReactNode;
  /** Replace the empty / filtered / error state body. Receives the reason. */
  empty?: (ctx: { reason: EmptyReason }) => ReactNode;
}

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
  /**
   * Declares grid as a user-selectable view (requires `cardTitle`/`cardContent`).
   * When set, the FilterBar auto-shows a list/grid toggle. Independent of the
   * responsive `cardBreakpoint` fallback.
   */
  gridView?: boolean;
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
  /**
   * Sticks the header row to the top of the nearest scrollable ancestor
   * (e.g. a page, dialog, or detail-pane body) once scrolling would hide it.
   * The table keeps its own horizontal scrollbar; the floating header scrolls
   * with its columns. Enabled by default; pass `false` to disable.
   */
  stickyHeader?: boolean;
  /** Declarative row action buttons. Automatically appends an action column to the table. */
  actions?: RowActionDef<T>[];
  /** Visual variant for action buttons. Defaults to `"outline"`. */
  actionVariant?: ActionVariant;
  /** Override the auto-calculated action column width (px). */
  actionColumnWidth?: number;
  /**
   * Lets the reader drag a column's trailing edge, keeping the width under this key.
   *
   * <p>Omit and the columns stay exactly as the screen declared them. Supply a key — one per list
   * screen — and every column carrying a `field` grows a grab zone whose width outlives the visit.
   * Two renderings of the same list share a key on purpose: they are the same columns, and a
   * reader who widened one meant the column rather than the placement.
   *
   * <p>Widths are stored by the column's `field`, so inserting a column does not move a stored
   * width onto its neighbour and translating the header does not lose it.
   */
  resizableColumns?: string;
  /** Per-instance render overrides for the action cluster and empty state. */
  slots?: ListTableSlots<T>;
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
  /**
   * Puts the rows under headings, one heading per distinct key.
   *
   * A catalogue people navigate by band rather than by row — ranks under 임원 / 관리 / 현장,
   * organizations under principal / contractor — reads as a flat list without this, and the
   * reader scans every row to find where one band ends.
   *
   * Rows are bucketed, so a group is contiguous whatever the sort: `sort` then orders the rows
   * *within* a group and `order` (or first appearance) orders the groups themselves. Without
   * bucketing a catalogue sorted by rank would print the same heading twice the moment one
   * member of a band sorted away from the rest, which is the usual case rather than the odd one.
   *
   * Grouping is a property of the page in front of the reader: it applies to the rows this page
   * holds, and says nothing about the ones on the next. It does not apply in card mode, where
   * the rows are no longer a table.
   */
  groupBy?: ListGroupConfig<T>;
  className?: string;
  children?: ReactNode;
}

/** How {@link ListTableProps.groupBy} decides the headings and their order. */
export interface ListGroupConfig<T> {
  /** The group a row belongs to. Return null for a row that belongs to none. */
  of: (row: T) => string | null | undefined;
  /** What a heading prints. Defaults to the key itself. */
  label?: (key: string) => ReactNode;
  /**
   * The groups in the order they are drawn, by key. A key the rows never produce draws no
   * heading, and a key not named here follows the named ones in first-appearance order — so a
   * value added to the enum later appears rather than disappearing.
   */
  order?: readonly string[];
  /**
   * The heading the rows with no group sit under. Omit and they follow the groups with no
   * heading of their own, which is right when 「no group」 is an absence rather than a category.
   */
  ungrouped?: ReactNode;
}

/** The page's rows as headings and rows, in the order they are drawn. */
function groupRows<T, R extends { original: T }>(
  rows: R[],
  config: ListGroupConfig<T> | undefined,
): { key: string | null; label: ReactNode; rows: R[] }[] | null {
  if (!config) return null;
  const buckets = new Map<string | null, R[]>();
  for (const row of rows) {
    const key = config.of(row.original) ?? null;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(row);
    else buckets.set(key, [row]);
  }

  // Named groups first, in the order the caller gave; then whatever the rows produced that the
  // caller did not name, so a key added upstream shows up instead of taking its rows with it.
  const named = (config.order ?? []).filter((key) => buckets.has(key));
  const rest = [...buckets.keys()].filter(
    (key) => key !== null && !named.includes(key),
  ) as string[];

  const out: { key: string | null; label: ReactNode; rows: R[] }[] = [];
  for (const key of [...named, ...rest]) {
    out.push({ key, label: config.label ? config.label(key) : key, rows: buckets.get(key) ?? [] });
  }
  // The ungrouped rows come last whether or not they are given a heading: they are what is left
  // over, and putting them first would read as the first category.
  if (buckets.has(null)) {
    out.push({ key: null, label: config.ungrouped ?? null, rows: buckets.get(null) ?? [] });
  }
  return out;
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
  /**
   * The list's key, when the reader may size its columns.
   *
   * <p>A reorderable list is still a list, and its columns are as likely to be too narrow as any
   * other's. The two branches divide over how a ROW moves, which has nothing to say about how
   * wide a COLUMN is — so a table that accepted this prop on one branch and dropped it on the
   * other would take the declaration, store nothing, and draw no handle, with the screen's
   * author left reading their own correct code.
   */
  resizableColumns?: string;
  columnWidths: ColumnWidths;
  onPreviewColumnWidth: (field: string, width: number) => void;
  onCommitColumnWidth: (field: string, width: number) => void;
  onResetColumnWidth: (field: string) => void;
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
  maxHeight?: TableProps["maxHeight"];
  fill?: TableProps["fill"];
  stickyHeader?: boolean;
  className?: string;
}

function ReorderableTable<T>({
  reorderConfig,
  data,
  sort,
  onSortChange,
  table,
  resizableColumns,
  columnWidths,
  onPreviewColumnWidth,
  onCommitColumnWidth,
  onResetColumnWidth,
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
  maxHeight,
  fill,
  stickyHeader,
  className,
}: ReorderableTableProps<T>) {
  const { t } = useTranslation("simplix/ui");
  const { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Skeleton } = useFlatUIComponents();
  const emptyMessages: Record<EmptyReason, string> = {
    "no-data": t("list.noData"),
    "no-filter": t("list.noFilter"),
    "no-search": t("list.noSearch"),
    "error": t("list.error"),
    "unavailable": t("list.unavailable"),
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
          {headerGroup.headers.map((header) => {
            // A column the reader has sized wins over the declared width, exactly as on the
            // plain branch. Kept as one expression in both places so a change to how a width is
            // applied cannot land on one branch and not the other.
            const readerWidth = columnWidths[header.column.id];
            const sizable = !!resizableColumns && isSizableColumn(header.column.id);
            return (
              <TableHead
                key={header.id}
                className={cn("truncate", sizable && "relative")}
                style={
                  readerWidth !== undefined
                    ? sizedHeaderStyle(readerWidth)
                    : header.column.getSize() !== 150
                      ? { width: header.column.getSize() }
                      : undefined
                }
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
                {sizable && (
                  <ColumnResizeHandle
                    field={header.column.id}
                    onPreview={onPreviewColumnWidth}
                    onCommit={onCommitColumnWidth}
                    onReset={onResetColumnWidth}
                    label={t("list.resizeColumn")}
                  />
                )}
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );

  if (isLoading && data.length === 0) {
    return (
      <Table variant={variant} size={size} density={density} rounded={rounded} maxHeight={maxHeight} fill={fill} stickyHeader={stickyHeader} className={cn("table-auto", className)}>
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
      return <EmptyState className="min-h-[280px]" {...emptyState} />;
    }
    if (emptyReason !== "no-data") {
      return <EmptyReasonCard reason={emptyReason} />;
    }
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
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
      <Table variant={variant} size={size} density={density} rounded={rounded} maxHeight={maxHeight} fill={fill} stickyHeader={stickyHeader} className={cn("table-auto", className)}>
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
                  columnWidths={columnWidths}
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
  actionVariant,
  cardTitle,
  cardContent,
}: ReorderableCardListProps<T>) {
  const { t } = useTranslation("simplix/ui");
  // The product's answer, not this component's — see UIDefaults. A screen still overrides it
  // where its own columns genuinely need the compact strip.
  const uiDefaults = useUIDefaults();
  const resolvedVariant = actionVariant ?? uiDefaults.actionVariant;
  const { Skeleton } = useFlatUIComponents();
  const emptyMessages: Record<EmptyReason, string> = {
    "no-data": t("list.noData"),
    "no-filter": t("list.noFilter"),
    "no-search": t("list.noSearch"),
    "error": t("list.error"),
    "unavailable": t("list.unavailable"),
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
      return <EmptyState className="min-h-[280px]" {...emptyState} />;
    }
    if (emptyReason !== "no-data") {
      return <EmptyReasonCard reason={emptyReason} />;
    }
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
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
                cardActions={actions && actions.length > 0 ? <RowActionCell row={row} actions={actions} variant={resolvedVariant} /> : undefined}
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

/**
 * Whether a column is one a reader may size.
 *
 * <p>The selection box and the action cluster are not columns anyone sizes: one holds a checkbox
 * and the other holds buttons, and both are as wide as their contents and no wider. They are also
 * the two whose id the table invents rather than takes from a field, which is what identifies
 * them here.
 *
 * @param columnId the column's id
 * @returns whether it carries a grab zone
 */
function isSizableColumn(columnId: string): boolean {
  return !columnId.startsWith("_");
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
  gridView,
  cardTitle,
  cardContent,
  variant,
  size,
  density,
  rounded,
  stickyHeader = true,
  actions,
  actionVariant: actionVariantProp,
  actionColumnWidth: actionColumnWidthOverride,
  resizableColumns,
  slots,
  reorder,
  emptyReason,
  emptyState,
  rowClassName,
  groupBy,
  className,
  children,
}: ListTableProps<T>) {
  const { t, locale } = useTranslation("simplix/ui");
  // How dense a row action reads is the product's decision, not this table's — a screen that
  // names nothing gets the console's own answer rather than a constant written here.
  const uiDefaults = useUIDefaults();
  const actionVariant = actionVariantProp ?? uiDefaults.actionVariant;
  // Ambient default for datetime cells whose column declares no displayZone —
  // replaces the implicit browser zone when the app mounts a DisplayZoneProvider.
  const defaultDisplayZone = useDefaultDisplayZone();
  const { Badge, Skeleton, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } = useFlatUIComponents();
  const emptyMessages: Record<EmptyReason, string> = {
    "no-data": t("list.noData"),
    "no-filter": t("list.noFilter"),
    "no-search": t("list.noSearch"),
    "error": t("list.error"),
    "unavailable": t("list.unavailable"),
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);
  const hasCard = !!(cardTitle || cardContent);

  // Read synchronously on the first render rather than in an effect: an effect would paint the
  // table at the screen's widths and then snap it to the reader's on every load.
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(() =>
    resizableColumns ? readColumnWidths(resizableColumns) : {},
  );
  // A pointer move fires far faster than a table can usefully repaint, so the preview is folded
  // into one update per frame. Without this the drag stutters on a full page of rows.
  const previewFrame = useRef<number | null>(null);

  const previewColumnWidth = useCallback((field: string, width: number) => {
    if (previewFrame.current !== null) cancelAnimationFrame(previewFrame.current);
    previewFrame.current = requestAnimationFrame(() => {
      previewFrame.current = null;
      setColumnWidths((current) => ({ ...current, [field]: width }));
    });
  }, []);

  const commitColumnWidth = useCallback(
    (field: string, width: number) => {
      if (!resizableColumns) return;
      setColumnWidths((current) => {
        const next = { ...current, [field]: width };
        writeColumnWidths(resizableColumns, next);
        return next;
      });
    },
    [resizableColumns],
  );

  const resetColumnWidth = useCallback(
    (field: string) => {
      if (!resizableColumns) return;
      setColumnWidths((current) => {
        const next = { ...current };
        delete next[field];
        writeColumnWidths(resizableColumns, next);
        return next;
      });
    },
    [resizableColumns],
  );

  useEffect(
    () => () => {
      if (previewFrame.current !== null) cancelAnimationFrame(previewFrame.current);
    },
    [],
  );

  const columnCtx = useCrudListColumns();

  const responsiveCardMode = !!(
    cardBreakpoint &&
    hasCard &&
    containerWidth > 0 &&
    containerWidth < cardBreakpoint
  );
  const manualGrid = !!(gridView && hasCard && columnCtx?.viewMode === "grid");
  const isCardMode = manualGrid || responsiveCardMode;

  // Inside a CrudList.TableCard the table is the scroll region with a sticky
  // header; base Table owns the overflow so this wrapper must not also scroll.
  const frame = useTableCardFrame();
  const framed = !!frame?.framed && !isCardMode;

  // Declare grid as a selectable view so the FilterBar can auto-show the toggle.
  useEffect(() => {
    columnCtx?.setCanGridView(!!gridView && hasCard);
  }, [gridView, hasCard, columnCtx?.setCanGridView]);

  // Sync card-mode flags to context: effective mode hides the column toggle,
  // responsive-forced mode hides the view toggle.
  useEffect(() => {
    columnCtx?.setIsCardMode(isCardMode);
  }, [isCardMode, columnCtx?.setIsCardMode]);
  useEffect(() => {
    columnCtx?.setResponsiveCardMode(responsiveCardMode);
  }, [responsiveCardMode, columnCtx?.setResponsiveCardMode]);
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
            aria-label={t("list.selectAllRows")}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIndices?.has(row.index) ?? false}
            onChange={() => onSelectionChange?.(row.index)}
            className="h-4 w-4 rounded border-gray-300"
            aria-label={t("list.selectRow", { index: row.index + 1 })}
          />
        ),
        size: 40,
      });
    }

    for (let i = 0; i < columnDefs.length; i++) {
      const colDef = columnDefs[i];
      // Both props size the header box the same way; they differ only in whether
      // the body cell is allowed to widen the column past it (see `flexible`).
      const declaredWidth = colDef.width ?? colDef.minWidth;
      // A floor rather than a fixed width: the header holds the column open at
      // `minWidth`, and zeroing the body cell's max-width keeps the data from
      // setting the column's intrinsic width, so spare table width lands here.
      const flexible = colDef.width === undefined && colDef.minWidth !== undefined;
      cols.push({
        id: colDef.field ?? `_col_${i}`,
        accessorFn: colDef.field
          ? (row) => (row as Record<string, unknown>)[colDef.field!]
          : () => null,
        header: () => {
          const isSorted = colDef.field ? sort?.field === colDef.field : false;
          const dir = isSorted ? sort!.direction : null;
          const label = colDef.header ?? "";
          // A declared width gives the header box a definite size, which caps the
          // column's intrinsic width in the auto table layout — otherwise the
          // nowrap label keeps the column as wide as its longest header. The label
          // then ellipsizes and carries its full text in a tooltip.
          // The label carries the width so it ellipsizes at the column's edge. Left at the
          // declared number it would go on ellipsizing at the old edge inside a column the
          // reader has just widened — they would drag, watch the column grow, and watch the
          // text not grow with it.
          const readerWidth = columnWidths[colDef.field ?? `_col_${i}`];
          const headerStyle =
            readerWidth !== undefined
              ? { width: "100%", maxWidth: "100%" }
              : declaredWidth
                ? { width: declaredWidth }
                : undefined;

          const content =
            colDef.sortable && colDef.field ? (
              <button
                type="button"
                onClick={() => handleSortChange(colDef.field!)}
                className={cn(
                  "inline-flex max-w-full items-center font-semibold hover:text-foreground",
                  isSorted && "text-foreground",
                )}
                style={headerStyle}
              >
                <span className="truncate">{label}</span>
                <SortIcon direction={dir} />
              </button>
            ) : declaredWidth ? (
              <span className="block truncate" style={headerStyle}>
                {label}
              </span>
            ) : (
              label
            );

          // A width-constrained header can ellipsize, so its full text stays
          // reachable on hover / keyboard focus.
          if (declaredWidth && label) {
            return (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {typeof content === "string" ? <span>{content}</span> : content}
                  </TooltipTrigger>
                  <TooltipContent side="top">{label}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }
          return content;
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
            const label = colDef.enumName && colDef.enumLabel ? colDef.enumLabel(colDef.enumName, strVal) : strVal;
            return <Badge variant={variant}>{label}</Badge>;
          }

          // Boolean display
          if (colDef.display === "boolean") {
            return <BooleanBadge value={!!value} />;
          }

          // Country display
          if (colDef.display === "country") {
            return <CountryCell value={String(value ?? "")} />;
          }

          // Phone display
          if (colDef.display === "phone") {
            return <PhoneCell value={String(value ?? "")} />;
          }

          // Format
          const cellZone =
            (typeof colDef.displayZone === "function"
              ? colDef.displayZone(row.original)
              : colDef.displayZone) ?? defaultDisplayZone;
          return formatCellValue(value, colDef.format, locale, cellZone);
        },
        size: declaredWidth,
        meta: { flexible },
      });
    }

    const hasActions = !!(actions && actions.length > 0);
    if (hasActions || slots?.rowActions) {
      const colWidth =
        actionColumnWidthOverride ??
        (hasActions ? getActionColumnWidth(actions as RowActionDef<unknown>[], actionVariant) : 120);
      cols.push({
        id: "_actions",
        header: () => "",
        cell: ({ row }) =>
          slots?.rowActions ? (
            slots.rowActions({ row: row.original })
          ) : (
            <RowActionCell row={row.original} actions={actions!} variant={actionVariant} />
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
    slots,
    defaultDisplayZone,
    columnWidths,
    t,
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
    if (slots?.empty) {
      return (
        <div ref={containerRef} className="w-full">
          {slots.empty({ reason: emptyReason })}
        </div>
      );
    }
    if (emptyReason === "no-data" && emptyState) {
      return (
        <div ref={containerRef} className="w-full">
          <EmptyState className="min-h-[280px]" {...emptyState} />
        </div>
      );
    }
    if (emptyReason !== "no-data") {
      return (
        <div ref={containerRef} className="w-full">
          <EmptyReasonCard reason={emptyReason} bordered={!framed} />
        </div>
      );
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full",
        framed && frame?.fill && "flex min-h-0 flex-1 flex-col",
      )}
    >
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
                    aria-label={t("list.selectAll")}
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
                      onClick={rowClickHandler(row, onRowClick)}
                      data-testid={`list-row-${rid}`}
                    >
                      {cardTitle && (
                        <Flex align="center" justify="between" className={cn("border-b px-2 py-1.5")}>
                          <div className="min-w-0 flex-1">{createElement(cardTitle, { row, index })}</div>
                          <Flex gap="xs" align="center" className="shrink-0 ml-2" {...rowClickIgnoreProps}>
                            {slots?.rowActions
                              ? slots.rowActions({ row })
                              : actions && actions.length > 0 && (
                                  <RowActionCell row={row} actions={actions} variant={actionVariant} />
                                )}
                            {selectable && (
                              <input
                                type="checkbox"
                                checked={isSelected ?? false}
                                onChange={() => onSelectionChange?.(index)}
                                className="h-4 w-4 rounded border-gray-300"
                                aria-label={t("list.selectRow", { index: index + 1 })}
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
              resizableColumns={resizableColumns}
              columnWidths={columnWidths}
              onPreviewColumnWidth={previewColumnWidth}
              onCommitColumnWidth={commitColumnWidth}
              onResetColumnWidth={resetColumnWidth}
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
              maxHeight={framed ? frame?.maxHeight : undefined}
              fill={framed ? frame?.fill : undefined}
              stickyHeader={framed || stickyHeader}
              className={className}
            />
          ) : (
            <Table
              variant={variant}
              size={size}
              density={density}
              rounded={rounded}
              maxHeight={framed ? frame?.maxHeight : undefined}
              fill={framed ? frame?.fill : undefined}
              stickyHeader={framed || stickyHeader}
              className={cn("table-auto", className)}
            >
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      // A column the reader has sized wins over the declared width. All three of
                      // width/min/max, because an auto table treats width alone as a suggestion.
                      const readerWidth = columnWidths[header.column.id];
                      const sizable = !!resizableColumns && isSizableColumn(header.column.id);
                      return (
                        <TableHead
                          key={header.id}
                          className={cn("truncate", sizable && "relative")}
                          style={
                            readerWidth !== undefined
                              ? sizedHeaderStyle(readerWidth)
                              : header.column.getSize() !== 150
                                ? { width: header.column.getSize() }
                                : undefined
                          }
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          {sizable && (
                            <ColumnResizeHandle
                              field={header.column.id}
                              onPreview={previewColumnWidth}
                              onCommit={commitColumnWidth}
                              onReset={resetColumnWidth}
                              label={t("list.resizeColumn")}
                            />
                          )}
                        </TableHead>
                      );
                    })}
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
                    : (() => {
                      const modelRows = table.getRowModel().rows;
                      const drawRow = (row: (typeof modelRows)[number]) => {
                        const rid = rowId?.(row.original) ?? row.id;
                        const isActive = activeRowId != null && rid === activeRowId;
                        return (
                          <TableRow
                            key={row.id}
                            className={cn(
                              selectedIndices?.has(row.index) && "bg-muted",
                              isActive && "bg-muted/50",
                              onRowClick && "cursor-pointer",
                              rowClassName?.(row.original),
                            )}
                            onClick={rowClickHandler(row.original, onRowClick)}
                            data-testid={`list-row-${rid}`}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell
                                key={cell.id}
                                className="truncate"
                                {...rowClickIgnoreForColumn(cell.column.id)}
                                {...sizedCellProps(
                                  cell.column.id,
                                  columnWidths,
                                  cell.column.columnDef.meta as { flexible?: boolean } | undefined,
                                )}
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      };

                      const grouped = groupRows(modelRows, groupBy);
                      if (!grouped) return modelRows.map(drawRow);
                      return grouped.map((group) => (
                        <Fragment key={group.key ?? "\u0000ungrouped"}>
                          {/* A heading is not a record: it is skipped by row navigation, it
                              carries no row actions, and it spans the table so a reader does not
                              look for a value under each column header. */}
                          {group.label !== null && group.label !== undefined && (
                            <TableRow
                              className="hover:bg-transparent"
                              data-testid={`list-group-${group.key ?? "ungrouped"}`}
                            >
                              <TableCell
                                colSpan={table.getAllColumns().length}
                                className="bg-muted/40 py-1 text-xs font-semibold text-muted-foreground"
                              >
                                {group.label}
                              </TableCell>
                            </TableRow>
                          )}
                          {group.rows.map(drawRow)}
                        </Fragment>
                      ));
                    })()}
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
  // Inside a TableCard the pager docks as the card footer (card bg).
  const framed = !!useTableCardFrame()?.framed;
  const { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } = useFlatUIComponents();
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
        <SelectTrigger size="xs" className="w-[64px] rounded-md border-border bg-card font-medium text-secondary-foreground" aria-label={t("list.pageSize")}>
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

  const navCell =
    "inline-flex h-6 items-center justify-center rounded-md border border-border bg-card text-xs font-medium text-secondary-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50";

  const prevButton = (
    <button
      type="button"
      disabled={page <= 1}
      onClick={() => onPageChange(page - 1)}
      className={cn(navCell, "w-8")}
      aria-label={t("list.previousPage")}
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
      className={cn(navCell, "w-8")}
      aria-label={t("list.nextPage")}
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  const pageNumbers = isCompact ? null : getPageNumbers(page, totalPages);

  return (
    <div ref={containerRef} className={cn("flex w-full items-center justify-end gap-2 border-t px-3.5 py-2.5", framed ? "bg-card" : "bg-muted/60", className)}>
      <Flex gap="sm" align="center">
        {pageSizeSelector}
        <Flex gap="xs" align="center">
        {prevButton}
        {isCompact ? (
          <span className="text-xs">{page} / {totalPages}</span>
        ) : (
          pageNumbers!.map((p, i) =>
            p === "ellipsis" ? (
              <span key={`ellipsis-${i}`} className="inline-flex h-6 min-w-[26px] items-center justify-center text-xs text-muted-foreground">
                &hellip;
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  navCell,
                  "min-w-[26px] px-2",
                  p === page &&
                    "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
                aria-label={t("list.pageNumber", { page: p })}
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
          ? "text-foreground hover:bg-muted"
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
    "unavailable": t("list.unavailable"),
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
  TableCard: ListTableCard,
  Column: ListColumn,
  Pagination: ListPagination,
  BulkActions: ListBulkActions,
  BulkAction: ListBulkAction,
  Empty: ListEmpty,
});
