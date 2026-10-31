import { type ComponentType, Fragment, type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslation } from "@simplix-react/i18n/react";

import type { DateRange } from "../../base/controls/calendar";
import { FieldChevron } from "../../base/inputs/field-chevron";
import { Flex } from "../../primitives/flex";
import { partAttributes, slotAttributes } from "../../design/slot-style";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { endOfDay, startOfDay } from "../../utils/date-math";
import { formatDateRange, toLocalDateString } from "../../utils/format-date";
import { parseDate } from "../../utils/parse-date";
import { decodeInstant, serializeInstant } from "../../utils/rfc3339-date";
import { useCrudListColumns } from "../shared/column-context";
import { ListTotalBadge } from "../shared/list-total-badge";
import { CheckIcon, ColumnsIcon, EyeIcon, FunnelIcon, LayoutGridIcon, RowsIcon, SpinnerIcon, XIcon } from "../shared/icons";
import { CountryFormField } from "./country-form-field";
import { FieldClearButton } from "./field-clear-button";
import { operatorConfig } from "./filter-icons";
import {
  crudFilterBarCalendarStyle,
  crudFilterBarChipRemoveStyle,
  crudFilterBarColumnStyle,
  crudFilterBarColumnsButtonStyle,
  crudFilterBarDividerStyle,
  crudFilterBarDropdownTriggerStyle,
  crudFilterBarDropdownValueStyle,
  crudFilterBarFieldStyle,
  crudFilterBarFieldsStyle,
  crudFilterBarLeadingStyle,
  crudFilterBarNoOptionsStyle,
  crudFilterBarOperatorLabelStyle,
  crudFilterBarOperatorOptionStyle,
  crudFilterBarOperatorRowStyle,
  crudFilterBarOptionsLoadingStyle,
  crudFilterBarOptionsStyle,
  crudFilterBarPopoverHeaderStyle,
  crudFilterBarRangeTextStyle,
  crudFilterBarSegmentStyle,
  crudFilterBarTriggerLabelStyle,
  crudFilterBarToggleFieldStyle,
  crudFilterBarToggleLeaderStyle,
  crudFilterBarTrailingStyle,
  crudFilterBarTriggerStyle,
  crudFilterBarStyle,
  crudFilterBarViewButtonStyle,
} from "./filter-bar.style";
import { crudFilterOptionCheckStyle, crudFilterOptionIconStyle } from "./filter-parts.style";
import { TimezoneFormField } from "./timezone-form-field";
import { SearchOperator } from "./filter-types";
import { makeFilterKey } from "./filter-utils";
import type { CrudListFilters } from "../list/use-crud-list";

// ── FilterDef Types ──

interface FilterDefBase {
  field: string;
  label: string;
  /**
   * When the filter popover renders in multiple columns, start a new column at
   * this filter. Up to (columns - 1) flags take effect, in order; without flags
   * the fields are split evenly (column-major). Ignored in single-column layout.
   */
  columnBreak?: boolean;
}

/** One selectable value of a text filter whose values come from a closed catalogue. */
export interface TextFilterOptionDef {
  value: string;
  label: string;
}

export interface TextFilterDef extends FilterDefBase {
  type: "text";
  operators: SearchOperator[];
  defaultOperator: SearchOperator;
  placeholder?: string;
  /**
   * Closed catalogue the value is picked from instead of typed. Use it for a column
   * the server matches literally — a constant key, a code — where a typo produces an
   * empty result the operator cannot tell from "no such row". The pick still travels
   * under the current operator, so a CONTAINS filter over a column packing several
   * keys keeps working.
   */
  options?: TextFilterOptionDef[];
}

export interface NumberFilterDef extends FilterDefBase {
  type: "number";
  operators: SearchOperator[];
  defaultOperator: SearchOperator;
  placeholder?: string;
}

/** One selectable value of a faceted filter. */
export interface FacetedFilterOptionDef {
  value: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
}

export interface FacetedFilterDef extends FilterDefBase {
  type: "faceted";
  /**
   * The values on offer. In server-search mode (see {@link onSearch}) this is the
   * current result page rather than the whole set.
   */
  options: FacetedFilterOptionDef[];
  multiSelect?: boolean;
  /**
   * Presentation of the option list. "list" (default) renders the searchable
   * checkbox list inline; "dropdown" collapses it behind a combobox-style
   * trigger — use for long option sets such as entity/user pickers.
   */
  display?: "list" | "dropdown";
  /**
   * Switches the filter to server search: what the operator types is debounced and
   * handed here instead of filtering {@link options} locally, so a directory larger
   * than one page stays reachable. The caller answers by replacing `options` with
   * the matching page.
   *
   * Pair it with {@link selectedOptions}, or a value picked from an earlier page
   * loses its label as soon as the search text moves past it.
   */
  onSearch?: (query: string) => void;
  /** Debounce applied to {@link onSearch}, in milliseconds. Default 300. */
  searchDebounceMs?: number;
  /** Whether the query behind {@link onSearch} is in flight. */
  loading?: boolean;
  /**
   * Labels for values that are selected but absent from the current {@link options}
   * page. They head the option list and back the active-filter badge, so a selection
   * keeps its name instead of degrading to a raw id.
   */
  selectedOptions?: FacetedFilterOptionDef[];
  /** Rendered below the option list — e.g. a "more results" hint. */
  footer?: ReactNode;
}

export interface ToggleFilterDef extends FilterDefBase {
  type: "toggle";
}

export interface DateRangeFilterDef extends FilterDefBase {
  type: "dateRange";
  /**
   * Set for a `LocalDate` (`format:date`) column: the range boundaries are
   * serialized as zone-neutral `yyyy-MM-dd` (local) instead of a UTC ISO
   * timestamp, so date filtering matches the stored calendar date regardless
   * of the browser timezone. Leave unset (default) for `date-time` columns,
   * which keep full UTC ISO serialization.
   */
  dateOnly?: boolean;
  /**
   * Set for a site-scoped `Instant` column whose day boundaries must be computed
   * in the site zone: the picked day's start-of-day / end-of-day are interpreted
   * IN this IANA zone and sent as offset-bearing instants (via
   * {@link serializeInstant}), so the fetched window is identical in any browser
   * zone. Takes precedence over {@link dateOnly}.
   */
  displayZone?: string;
}

export interface CountryFilterDef extends FilterDefBase {
  type: "country";
}

export interface TimezoneFilterDef extends FilterDefBase {
  type: "timezone";
}

export type FilterDef =
  | TextFilterDef
  | NumberFilterDef
  | FacetedFilterDef
  | ToggleFilterDef
  | DateRangeFilterDef
  | CountryFilterDef
  | TimezoneFilterDef;

/** How long a faceted filter waits after the last keystroke before searching. */
const DEFAULT_FACET_SEARCH_DEBOUNCE_MS = 300;

// ── FilterBar Props ──

export interface FilterBarProps {
  filters: FilterDef[];
  state: CrudListFilters;
  /** Content rendered on the left side of the filter bar. */
  leading?: ReactNode;
  /** Content rendered on the right side of the filter bar, before the filter/columns group. */
  trailing?: ReactNode;
  /** Max number of visible filter badges before collapsing into "+N". */
  maxBadges?: number;
  /**
   * When provided, renders a preview button in the leading group that invokes
   * this handler on click. Omit to hide the button.
   */
  onPreview?: () => void;
  /** Label for the preview button. Defaults to the `list.preview` translation. */
  previewLabel?: string;
  /** When provided, renders a standard total-count badge at the start of the leading group. */
  count?: number;
  /**
   * Overrides where the badge takes its "count not known yet" state from.
   * Defaults to the list state's own `isLoading`, so a `useCrudList` list needs
   * nothing here; pass it on a standalone FilterBar whose count comes from a
   * query the filter state knows nothing about.
   */
  countLoading?: boolean;
  /**
   * Column layout of the filter popover form.
   *
   * - `"auto"` (default) — one column; switches to two columns when the form
   *   overflows its max height (a vertical scrollbar would appear).
   * - `1` — always a single 320px column.
   * - `2` — always two columns in a 560px popover.
   * - `3` — always three columns in an 800px popover.
   *
   * Column boundaries follow `columnBreak` flags on the filter definitions;
   * without flags the filters are split evenly.
   */
  popoverColumns?: 1 | 2 | 3 | "auto";
  className?: string;
}

/**
 * Split filters into `count` popover columns. Explicit `columnBreak` flags win
 * (each flagged filter starts the next column, up to `count - 1` flags);
 * otherwise the list is split evenly, column-major.
 */
export function splitFilterColumns(filters: FilterDef[], count = 2): FilterDef[][] {
  const flagged: number[] = [];
  filters.forEach((def, i) => {
    if (i > 0 && def.columnBreak && flagged.length < count - 1) flagged.push(i);
  });
  const bounds = flagged.length > 0
    ? flagged
    : Array.from({ length: count - 1 }, (_, c) => Math.ceil((filters.length * (c + 1)) / count));
  const columns: FilterDef[][] = [];
  let start = 0;
  for (const end of [...bounds, filters.length]) {
    columns.push(filters.slice(start, end));
    start = end;
  }
  return columns.filter((column) => column.length > 0);
}

// ── FilterBar Component ──

export function FilterBar({ filters, state, leading, trailing, maxBadges, onPreview, previewLabel, count, countLoading, popoverColumns = "auto", className }: FilterBarProps) {
  const { Badge, Button, Popover, PopoverTrigger, PopoverContent, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");
  const locale = useLocale();
  const columnCtx = useCrudListColumns();
  const [open, setOpen] = useState(false);

  // ── Two-column overflow layout ──
  // When the filter form overflows its max height (vertical scrollbar), latch into a
  // wider two-column layout for the remainder of this open cycle. The latch is one-way
  // to avoid oscillation (two columns reduce the height, which would clear the overflow).
  const fieldsRef = useRef<HTMLDivElement>(null);
  const [overflowTwoColumn, setOverflowTwoColumn] = useState(false);
  useLayoutEffect(() => {
    if (popoverColumns !== "auto") return;
    if (!open) {
      setOverflowTwoColumn(false);
      return;
    }
    const frame = requestAnimationFrame(() => {
      const el = fieldsRef.current;
      if (el && el.scrollHeight > el.clientHeight + 1) {
        setOverflowTwoColumn(true);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [open, popoverColumns]);
  const columnCount = typeof popoverColumns === "number"
    ? popoverColumns
    : overflowTwoColumn ? 2 : 1;
  const twoColumn = columnCount > 1;

  // Track current operator per text/number field
  const [operators, setOperators] = useState<Record<string, SearchOperator>>(() => {
    const init: Record<string, SearchOperator> = {};
    for (const def of filters) {
      if ("defaultOperator" in def) init[def.field] = def.defaultOperator;
    }
    return init;
  });

  // ── Badge helpers ──

  const getFilterKey = useCallback(
    (def: FilterDef): string => {
      switch (def.type) {
        case "text":
        case "number":
          return makeFilterKey(def.field, operators[def.field] ?? def.defaultOperator);
        case "faceted":
        case "country":
        case "timezone":
          return makeFilterKey(def.field, SearchOperator.IN);
        case "toggle":
          return makeFilterKey(def.field, SearchOperator.EQUALS);
        case "dateRange":
          return ""; // handled separately via gte/lte pair
      }
    },
    [operators],
  );

  const isFilterActive = useCallback(
    (def: FilterDef): boolean => {
      const vals = state.committedValues;
      if (def.type === "dateRange") {
        const gteKey = makeFilterKey(def.field, SearchOperator.GREATER_THAN_OR_EQUAL);
        const lteKey = makeFilterKey(def.field, SearchOperator.LESS_THAN_OR_EQUAL);
        return vals[gteKey] != null || vals[lteKey] != null;
      }
      if (def.type === "toggle") {
        return typeof vals[getFilterKey(def)] === "boolean";
      }
      if (def.type === "faceted" || def.type === "country" || def.type === "timezone") {
        const val = vals[getFilterKey(def)];
        return Array.isArray(val) && val.length > 0;
      }
      const val = vals[getFilterKey(def)];
      return val != null && val !== "";
    },
    [state.committedValues, getFilterKey],
  );

  const getBadgeIcon = useCallback(
    (def: FilterDef): ComponentType<{ className?: string }> | null => {
      if (def.type === "text" || def.type === "number") {
        const op = operators[def.field] ?? def.defaultOperator;
        return operatorConfig[op].icon;
      }
      return null;
    },
    [operators],
  );

  const getBadgeText = useCallback(
    (def: FilterDef): string => {
      const vals = state.committedValues;
      switch (def.type) {
        case "text": {
          const val = (vals[getFilterKey(def)] as string) ?? "";
          // A catalogue-backed filter holds the stored key; the badge names it the
          // way the picker did, falling back to the key when it is not on offer.
          return def.options?.find((o) => o.value === val)?.label ?? val;
        }
        case "number": {
          return String(vals[getFilterKey(def)] ?? "");
        }
        case "faceted": {
          const val = vals[getFilterKey(def)] as string[];
          if (val.length <= 2) {
            // A server-searched facet holds only the current result page in
            // `options`, so a selection made on an earlier page is named from
            // `selectedOptions` before falling back to the raw value.
            return val
              .map(
                (v) =>
                  def.selectedOptions?.find((o) => o.value === v)?.label ??
                  def.options.find((o) => o.value === v)?.label ??
                  v,
              )
              .join(", ");
          }
          return t("list.selected", { count: val.length });
        }
        case "country": {
          const val = vals[getFilterKey(def)] as string[];
          if (val.length <= 2) {
            const displayNames = new Intl.DisplayNames([locale], { type: "region" });
            return val.map((v) => displayNames.of(v) ?? v).join(", ");
          }
          return t("list.selected", { count: val.length });
        }
        case "timezone": {
          const val = vals[getFilterKey(def)] as string[];
          if (val.length <= 2) return val.join(", ");
          return t("list.selected", { count: val.length });
        }
        case "toggle": {
          const val = vals[getFilterKey(def)] as boolean;
          return val ? t("common.yes") : t("common.no");
        }
        case "dateRange": {
          const gteKey = makeFilterKey(def.field, SearchOperator.GREATER_THAN_OR_EQUAL);
          const lteKey = makeFilterKey(def.field, SearchOperator.LESS_THAN_OR_EQUAL);
          const from = vals[gteKey] ? new Date(vals[gteKey] as string) : undefined;
          const to = vals[lteKey] ? new Date(vals[lteKey] as string) : undefined;
          return formatDateRange(from, to, locale) ?? "";
        }
      }
    },
    [state.committedValues, getFilterKey, locale, t],
  );

  const removeFilter = useCallback(
    (def: FilterDef) => {
      if (def.type === "dateRange") {
        const gteKey = makeFilterKey(def.field, SearchOperator.GREATER_THAN_OR_EQUAL);
        const lteKey = makeFilterKey(def.field, SearchOperator.LESS_THAN_OR_EQUAL);
        state.commitValues({ [gteKey]: undefined, [lteKey]: undefined });
        return;
      }
      state.commitValue(getFilterKey(def), undefined);
    },
    [state, getFilterKey],
  );

  // ── Operator change handler ──

  const handleOperatorChange = useCallback(
    (def: TextFilterDef | NumberFilterDef, newOp: SearchOperator) => {
      const oldOp = operators[def.field] ?? def.defaultOperator;
      if (oldOp === newOp) return;
      const oldKey = makeFilterKey(def.field, oldOp);
      const newKey = makeFilterKey(def.field, newOp);
      const oldVal = state.values[oldKey];
      state.setValues({ [oldKey]: undefined, [newKey]: oldVal });
      setOperators((prev) => ({ ...prev, [def.field]: newOp }));
    },
    [operators, state],
  );

  // ── Clear all ──

  const clearAll = useCallback(() => {
    state.clear();
    // Reset operators to defaults
    const init: Record<string, SearchOperator> = {};
    for (const def of filters) {
      if ("defaultOperator" in def) init[def.field] = def.defaultOperator;
    }
    setOperators(init);
  }, [state, filters]);

  // ── Active badges ──

  const activeDefs = useMemo(
    () => filters.filter((def) => isFilterActive(def)),
    [filters, isFilterActive],
  );

  const hasActiveFilters = activeDefs.length > 0;
  const visibleDefs = maxBadges != null ? activeDefs.slice(0, maxBadges) : activeDefs;
  const hiddenCount = activeDefs.length - visibleDefs.length;

  // The first page in flight has no total: the badge holds its place with an
  // empty value rather than stating `Total 0` (read as "nothing here") or
  // appearing only once the value lands (which shifts the toolbar).
  const countUnknown = countLoading ?? state.isLoading ?? false;
  const showCount = count != null || countUnknown;
  const showViewToggle = !!columnCtx?.canGridView && !columnCtx?.responsiveCardMode;
  const showColumnsToggle = !!columnCtx && columnCtx.columns.length > 0 && !columnCtx.isCardMode;
  const hasLeadingGroup = showCount || !!leading || showViewToggle || !!onPreview;

  return (
    <Flex
      gap="xs"
      align="center"
      wrap
      justify={hasLeadingGroup ? "between" : "end"}
      className={cn("w-full", className)}
      {...partAttributes(crudFilterBarStyle, {})}
    >
      {hasLeadingGroup && (
        <div
          className="flex flex-row flex-wrap items-center"
          {...slotAttributes(crudFilterBarLeadingStyle, {})}
        >
          {showCount && <ListTotalBadge count={countUnknown ? undefined : count} />}
          {leading}
          {showViewToggle && (
            <div
              role="group"
              aria-label={t("filter.label")}
              className="box-border inline-flex h-8 items-center"
              {...slotAttributes(crudFilterBarSegmentStyle, { spaced: false })}
            >
              {([
                { mode: "list", Icon: RowsIcon, label: t("list.viewList") },
                { mode: "grid", Icon: LayoutGridIcon, label: t("list.viewGrid") },
              ] as const).map(({ mode, Icon, label }) => {
                const active = (columnCtx?.viewMode ?? "list") === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={active}
                    aria-label={label}
                    title={label}
                    onClick={() => columnCtx?.setViewMode(mode)}
                    className="inline-grid h-full w-7 place-items-center"
                    {...slotAttributes(crudFilterBarViewButtonStyle, { active })}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>
          )}
          {onPreview && (
            <Button variant="outline" size="sm" data-preview onClick={onPreview}>
              <EyeIcon className="h-3.5 w-3.5" />
              {previewLabel ?? t("list.preview")}
            </Button>
          )}
        </div>
      )}
      <div
        className="flex flex-row flex-wrap items-center"
        {...slotAttributes(crudFilterBarTrailingStyle, {})}
      >
      {visibleDefs.map((def) => {
        const BadgeIcon = getBadgeIcon(def);
        const badgeText = getBadgeText(def);
        return (
          <Badge
            key={def.field}
            variant="secondary"
            className="h-8 max-w-[12rem]"
            data-filter-chip
          >
            <span className="shrink-0">{def.label}:</span>
            {BadgeIcon && <BadgeIcon className="h-3 w-3 shrink-0" />}
            {/* The chip is capped at 12rem, so a long value is clipped. `title` is what
                the clipped tail is read from — without it a truncated range names a
                period nothing on the screen can spell out. */}
            <span className="truncate" title={badgeText}>
              {badgeText}
            </span>
            <button
              type="button"
              onClick={() => removeFilter(def)}
              className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center"
              aria-label={t("filter.removeFilter", { label: def.label })}
              {...slotAttributes(crudFilterBarChipRemoveStyle, {})}
            >
              <XIcon className="h-2.5 w-2.5" />
            </button>
          </Badge>
        );
      })}
      {hiddenCount > 0 && (
        <Badge variant="secondary" className="h-8" data-filter-more>
          +{hiddenCount}
        </Badge>
      )}
      {trailing}
      {/* Segmented group: filter trigger + columns toggle, styled like the view toggle. */}
      <div
        className="box-border inline-flex h-8 items-center"
        {...slotAttributes(crudFilterBarSegmentStyle, { spaced: true })}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={t("filter.label")}
              title={t("filter.label")}
              className="inline-flex h-full items-center [&_svg]:size-3.5"
              {...slotAttributes(crudFilterBarTriggerStyle, { active: hasActiveFilters })}
            >
              <FunnelIcon className="h-3.5 w-3.5" />
              <span {...slotAttributes(crudFilterBarTriggerLabelStyle, {})}>{t("filter.label")}</span>
              {hasActiveFilters && (
                <Badge className="h-4 min-w-[1rem] justify-center">
                  {activeDefs.length}
                </Badge>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            flush
            className={cn(
              "flex max-h-[min(70vh,var(--radix-popover-content-available-height,70vh))] flex-col",
              columnCount === 3 ? "w-200" : twoColumn ? "w-140" : "w-80",
            )}
            align="end"
            collisionPadding={16}
          >
            <div
              className="flex flex-row items-center justify-between"
              {...slotAttributes(crudFilterBarPopoverHeaderStyle, {})}
            >
              <span>{t("filter.label")}</span>
              <Flex gap="xs" align="center">
                <Button variant="ghost" size="sm" className="h-7" onClick={clearAll} disabled={!hasActiveFilters && !state.isPending}>
                  {t("common.clear")}
                </Button>
                <Button size="sm" className="h-7" disabled={!state.isPending} onClick={() => { state.apply(); setOpen(false); }}>
                  {t("filter.apply")}
                </Button>
              </Flex>
            </div>
            <div
              ref={fieldsRef}
              className="flex-1 overflow-y-auto"
              {...slotAttributes(crudFilterBarFieldsStyle, {})}
            >
              {twoColumn ? (
                // Two fully independent columns: fields are split column-major in JS and
                // each column is its own flex stack, so a tall field (e.g. a calendar)
                // neither stretches its horizontal neighbor nor gets fragmented the way
                // CSS multi-column would fragment it.
                <Flex gap="lg" align="stretch">
                  {splitFilterColumns(filters, columnCount).map((column, c) => (
                    <Fragment key={c}>
                      {c > 0 && <div aria-hidden className="w-px self-stretch" {...slotAttributes(crudFilterBarDividerStyle, { inset: false })} />}
                      <div className="flex min-w-0 flex-1 flex-col" {...slotAttributes(crudFilterBarColumnStyle, {})}>
                        {column.map((def) => (
                          <FilterFormField
                            key={def.field}
                            def={def}
                            state={state}
                            operators={operators}
                            onOperatorChange={handleOperatorChange}
                          />
                        ))}
                      </div>
                    </Fragment>
                  ))}
                </Flex>
              ) : (
                <div className="flex flex-col" {...slotAttributes(crudFilterBarColumnStyle, {})}>
                  {filters.map((def) => (
                    <FilterFormField
                      key={def.field}
                      def={def}
                      state={state}
                      operators={operators}
                      onOperatorChange={handleOperatorChange}
                    />
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        {showColumnsToggle && <span aria-hidden className="h-4 w-px" {...slotAttributes(crudFilterBarDividerStyle, { inset: true })} />}
        {showColumnsToggle && columnCtx && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={t("list.toggleColumns")}
                title={t("list.toggleColumns")}
                className="inline-grid h-full w-7 place-items-center [&_svg]:size-3.5"
                {...slotAttributes(crudFilterBarColumnsButtonStyle, {})}
              >
                <ColumnsIcon className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columnCtx.columns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.field}
                  checked={!columnCtx.hiddenColumns.has(col.field)}
                  onCheckedChange={(checked) => {
                    const next = new Set(columnCtx.hiddenColumns);
                    if (checked) next.delete(col.field);
                    else next.add(col.field);
                    columnCtx.setHiddenColumns(next);
                  }}
                >
                  {col.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      </div>
    </Flex>
  );
}

// ── FilterFormField (renders per-type form control in popover) ──

interface FilterFormFieldProps {
  def: FilterDef;
  state: CrudListFilters;
  operators: Record<string, SearchOperator>;
  onOperatorChange: (def: TextFilterDef | NumberFilterDef, op: SearchOperator) => void;
  className?: string;
}

function FilterFormField({ def, state, operators, onOperatorChange, className }: FilterFormFieldProps) {
  switch (def.type) {
    case "text":
      return <TextFormField def={def} state={state} operators={operators} onOperatorChange={onOperatorChange} className={className} />;
    case "number":
      return <NumberFormField def={def} state={state} operators={operators} onOperatorChange={onOperatorChange} className={className} />;
    case "faceted":
      return <FacetedFormField def={def} state={state} className={className} />;
    case "country":
      return <CountryFormField field={def.field} label={def.label} state={state} className={className} />;
    case "timezone":
      return <TimezoneFormField field={def.field} label={def.label} state={state} className={className} />;
    case "toggle":
      return <ToggleFormField def={def} state={state} className={className} />;
    case "dateRange":
      return <DateRangeFormField def={def} state={state} className={className} />;
  }
}

// ── Field Clear Button (re-exported from shared module) ──
// FieldClearButton is imported from ./field-clear-button

// ── Text Form Field ──

function OperatorIcon({
  operators,
  currentOp,
  onOperatorChange,
}: {
  operators: SearchOperator[];
  currentOp: SearchOperator;
  onOperatorChange?: (op: SearchOperator) => void;
}) {
  const { Select, SelectTrigger, SelectContent, SelectItem } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");
  const meta = operatorConfig[currentOp];

  return (
    <Select value={currentOp} onValueChange={(v) => onOperatorChange?.(v as SearchOperator)}>
      <SelectTrigger className="h-8 w-8 shrink-0 justify-center [&>svg]:hidden" aria-label={t("filter.selectOperator")}>
        <span className="flex items-center justify-center">
          <meta.icon className="h-3.5 w-3.5" />
        </span>
      </SelectTrigger>
      <SelectContent>
        {operators.map((op) => {
          const opMeta = operatorConfig[op];
          return (
            <SelectItem key={op} value={op}>
              <span className="flex items-center" {...slotAttributes(crudFilterBarOperatorOptionStyle, {})}>
                <opMeta.icon className="h-3.5 w-3.5" />
                <span {...slotAttributes(crudFilterBarOperatorLabelStyle, {})}>{t(opMeta.labelKey)}</span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function TextFormField({
  def,
  state,
  operators,
  onOperatorChange,
  className,
}: {
  def: TextFilterDef;
  state: CrudListFilters;
  operators: Record<string, SearchOperator>;
  onOperatorChange: (def: TextFilterDef, op: SearchOperator) => void;
  className?: string;
}) {
  const { Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } = useFlatUIComponents();
  const currentOp = operators[def.field] ?? def.defaultOperator;
  const key = makeFilterKey(def.field, currentOp);
  const value = (state.values[key] as string) ?? "";

  return (
    <div className={cn("flex flex-col", className)} {...slotAttributes(crudFilterBarFieldStyle, {})}>
      <Flex align="center" justify="between">
        <Label>{def.label}</Label>
        {value && <FieldClearButton onClick={() => state.setValue(key, undefined)} label={def.label} />}
      </Flex>
      <div
        className="flex flex-row items-center"
        {...slotAttributes(crudFilterBarOperatorRowStyle, {})}
      >
        <OperatorIcon
          operators={def.operators}
          currentOp={currentOp}
          onOperatorChange={(op) => onOperatorChange(def, op)}
        />
        {def.options ? (
          <Select value={value} onValueChange={(v) => state.setValue(key, v || undefined)}>
            <SelectTrigger className="h-8 flex-1" aria-label={def.label}>
              <SelectValue placeholder={def.placeholder ?? def.label} />
            </SelectTrigger>
            <SelectContent>
              {def.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type="text"
            value={value}
            onChange={(e) => state.setValue(key, e.target.value || undefined)}
            placeholder={def.placeholder ?? def.label}
            className="h-8 flex-1"
          />
        )}
      </div>
    </div>
  );
}

// ── Number Form Field ──

function NumberFormField({
  def,
  state,
  operators,
  onOperatorChange,
  className,
}: {
  def: NumberFilterDef;
  state: CrudListFilters;
  operators: Record<string, SearchOperator>;
  onOperatorChange: (def: NumberFilterDef, op: SearchOperator) => void;
  className?: string;
}) {
  const { Input, Label } = useFlatUIComponents();
  const currentOp = operators[def.field] ?? def.defaultOperator;
  const key = makeFilterKey(def.field, currentOp);
  const rawValue = state.values[key];
  const [inputStr, setInputStr] = useState(rawValue != null ? String(rawValue) : "");

  // Sync from external reset (inputStr intentionally excluded to avoid loops)
  useEffect(() => {
    const expected = rawValue != null ? String(rawValue) : "";
    setInputStr((prev) => prev === expected ? prev : expected);
  }, [rawValue]);

  const handleChange = useCallback(
    (raw: string) => {
      setInputStr(raw);
      if (raw === "") {
        state.setValue(key, undefined);
      } else {
        const num = Number(raw);
        if (!Number.isNaN(num)) {
          state.setValue(key, num);
        }
      }
    },
    [state, key],
  );

  const handleClear = useCallback(() => {
    setInputStr("");
    state.setValue(key, undefined);
  }, [state, key]);

  return (
    <div className={cn("flex flex-col", className)} {...slotAttributes(crudFilterBarFieldStyle, {})}>
      <Flex align="center" justify="between">
        <Label>{def.label}</Label>
        {rawValue != null && <FieldClearButton onClick={handleClear} label={def.label} />}
      </Flex>
      <div
        className="flex flex-row items-center"
        {...slotAttributes(crudFilterBarOperatorRowStyle, {})}
      >
        <OperatorIcon
          operators={def.operators}
          currentOp={currentOp}
          onOperatorChange={(op) => onOperatorChange(def, op)}
        />
        <Input
          type="number"
          value={inputStr}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={def.placeholder ?? def.label}
          className="h-8 flex-1"
        />
      </div>
    </div>
  );
}

// ── Faceted Form Field (inline checkbox list) ──

function FacetedFormField({
  def,
  state,
  className,
}: {
  def: FacetedFilterDef;
  state: CrudListFilters;
  className?: string;
}) {
  const { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, Label, Popover, PopoverTrigger, PopoverContent } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");
  const [open, setOpen] = useState(false);
  const key = makeFilterKey(def.field, SearchOperator.IN);
  const rawValue = state.values[key];
  const selectedValues = useMemo(
    () => new Set(Array.isArray(rawValue) ? (rawValue as string[]) : []),
    [rawValue],
  );

  const { onSearch, searchDebounceMs = DEFAULT_FACET_SEARCH_DEBOUNCE_MS } = def;
  const serverSearch = onSearch != null;
  const [query, setQuery] = useState("");

  // Hold the keystrokes back so a directory search runs once the operator pauses
  // rather than once per character. The input stays uncontrolled-fast; only the
  // dispatch to the caller is delayed.
  useEffect(() => {
    if (!onSearch) return undefined;
    const timer = setTimeout(() => onSearch(query), searchDebounceMs);
    return () => clearTimeout(timer);
  }, [onSearch, query, searchDebounceMs]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      const next = new Set(selectedValues);
      if (next.has(optionValue)) {
        next.delete(optionValue);
      } else {
        next.add(optionValue);
      }
      state.setValue(key, next.size === 0 ? undefined : [...next]);
    },
    [selectedValues, state, key],
  );

  // A server-searched page does not contain the values picked from earlier pages,
  // so those are pinned to the head of the list. Without them a selected row would
  // vanish from the list — and lose its label — the moment the query changes.
  const visibleOptions = useMemo(() => {
    if (!def.selectedOptions?.length) return def.options;
    const pinned = def.selectedOptions.filter((o) => selectedValues.has(o.value));
    const pinnedValues = new Set(pinned.map((o) => o.value));
    return [...pinned, ...def.options.filter((o) => !pinnedValues.has(o.value))];
  }, [def.options, def.selectedOptions, selectedValues]);

  const optionList = (
    <div {...slotAttributes(crudFilterBarOptionsStyle, { bordered: def.display !== "dropdown" })}>
    <Command
      // The server already answered the query; filtering that answer again locally
      // would hide rows whose match is on a field the label does not show.
      shouldFilter={!serverSearch}
    >
      <CommandInput
        placeholder={def.label}
        className="h-8"
        {...(serverSearch ? { value: query, onValueChange: setQuery } : {})}
      />
      <CommandList className="max-h-40">
        {def.loading ? (
          <div
            className="flex items-center justify-center"
            {...slotAttributes(crudFilterBarOptionsLoadingStyle, {})}
          >
            <SpinnerIcon className="h-4 w-4" />
            {t("common.loading")}
          </div>
        ) : (
          <CommandEmpty>{t("filter.noResultsFound")}</CommandEmpty>
        )}
        <CommandGroup>
          {visibleOptions.map((option) => {
            const isSelected = selectedValues.has(option.value);
            return (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value)}
              >
                <span
                  className="flex h-4 w-4 items-center justify-center"
                  {...slotAttributes(crudFilterOptionCheckStyle, { selected: isSelected })}
                >
                  <CheckIcon className="h-3 w-3" />
                </span>
                {option.icon && (
                  <span className="inline-flex" {...slotAttributes(crudFilterOptionIconStyle, {})}>
                    <option.icon className="h-4 w-4" />
                  </span>
                )}
                <span>{option.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
      {def.footer}
    </Command>
    </div>
  );

  if (def.display === "dropdown") {
    const selectedLabels = [...(def.selectedOptions ?? []), ...def.options]
      .filter((option) => selectedValues.has(option.value))
      .filter((option, index, all) => all.findIndex((o) => o.value === option.value) === index)
      .map((option) => option.label);

    return (
      <div className={cn("flex flex-col", className)} {...slotAttributes(crudFilterBarFieldStyle, {})}>
        <Flex align="center" justify="between">
          <Label>{def.label}</Label>
          {selectedValues.size > 0 && <FieldClearButton onClick={() => state.setValue(key, undefined)} label={def.label} />}
        </Flex>
        <Popover
          open={open}
          onOpenChange={(next: boolean) => {
            setOpen(next);
            // Re-opening starts from the default page, so the input the operator
            // sees and the results behind it agree.
            if (!next) setQuery("");
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={def.label}
              className="flex h-8 w-full items-center"
              {...slotAttributes(crudFilterBarDropdownTriggerStyle, {})}
            >
              <span
                className="flex-1 truncate"
                {...slotAttributes(crudFilterBarDropdownValueStyle, { empty: selectedValues.size === 0 })}
              >
                {selectedValues.size > 0 ? selectedLabels.join(", ") : t("field.selectOption")}
              </span>
              <FieldChevron />
            </button>
          </PopoverTrigger>
          <PopoverContent
            flush
            className="w-[var(--radix-popover-trigger-width)]"
            align="start"
            onOpenAutoFocus={(e: Event) => e.preventDefault()}
          >
            {optionList}
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)} {...slotAttributes(crudFilterBarFieldStyle, {})}>
      <Flex align="center" justify="between">
        <Label>{def.label}</Label>
        {selectedValues.size > 0 && <FieldClearButton onClick={() => state.setValue(key, undefined)} label={def.label} />}
      </Flex>
      {/* A server-searched facet starts empty on purpose — the input is what fills
          it, so the "nothing to pick" notice applies to eager option sets only. */}
      {serverSearch || visibleOptions.length > 0 ? (
        optionList
      ) : (
        <span {...slotAttributes(crudFilterBarNoOptionsStyle, {})}>{t("filter.noOptions")}</span>
      )}
    </div>
  );
}

// ── Toggle Form Field ──

function ToggleFormField({
  def,
  state,
  className,
}: {
  def: ToggleFilterDef;
  state: CrudListFilters;
  className?: string;
}) {
  const { Label, Switch } = useFlatUIComponents();
  const key = makeFilterKey(def.field, SearchOperator.EQUALS);
  const rawValue = state.values[key];
  const checked = typeof rawValue === "boolean" ? rawValue : false;
  const isActive = typeof rawValue === "boolean";

  return (
    <div
      className={cn("flex flex-row items-center min-h-6", className)}
      {...slotAttributes(crudFilterBarToggleFieldStyle, {})}
    >
      <Label>{def.label}</Label>
      <span
        aria-hidden="true"
        className="min-w-4 flex-1"
        {...slotAttributes(crudFilterBarToggleLeaderStyle, {})}
      />
      <Flex align="center" gap="xs">
        {isActive && <FieldClearButton onClick={() => state.setValue(key, undefined)} label={def.label} />}
        <Switch
          size="sm"
          checked={checked}
          onCheckedChange={(v) => state.setValue(key, v)}
        />
      </Flex>
    </div>
  );
}

// ── DateRange Form Field (inline calendar) ──

function DateRangeFormField({
  def,
  state,
  className,
}: {
  def: DateRangeFilterDef;
  state: CrudListFilters;
  className?: string;
}) {
  const { Calendar, Label } = useFlatUIComponents();
  const locale = useLocale();
  const gteKey = makeFilterKey(def.field, SearchOperator.GREATER_THAN_OR_EQUAL);
  const lteKey = makeFilterKey(def.field, SearchOperator.LESS_THAN_OR_EQUAL);
  // Parse each committed boundary back for the calendar. A site-zone Instant
  // column decodes into the site's wall clock; a date-only column parses the
  // local yyyy-MM-dd; otherwise the boundary is a plain UTC ISO instant.
  const from = state.values[gteKey]
    ? (def.displayZone
        ? decodeInstant(state.values[gteKey] as string, def.displayZone)
        : def.dateOnly
          ? parseDate(state.values[gteKey] as string)
          : new Date(state.values[gteKey] as string))
    : undefined;
  const to = state.values[lteKey]
    ? (def.displayZone
        ? decodeInstant(state.values[lteKey] as string, def.displayZone)
        : def.dateOnly
          ? parseDate(state.values[lteKey] as string)
          : new Date(state.values[lteKey] as string))
    : undefined;
  const hasValue = from || to;

  const rangeText = useMemo(() => {
    return formatDateRange(from, to, locale);
  }, [from, to, locale]);

  const handleRangeSelect = useCallback(
    (range: DateRange) => {
      // Site-zone Instant column: reinterpret the picked day's start/end-of-day
      // in the site zone and send offset-bearing instants (identical window in
      // any browser). LocalDate column: send zone-neutral yyyy-MM-dd (never UTC
      // ISO, which shifts the boundary a day east/west of UTC).
      state.setValues({
        [gteKey]: range.from
          ? (def.displayZone
              ? serializeInstant(startOfDay(range.from), def.displayZone)
              : def.dateOnly
                ? toLocalDateString(range.from)
                : startOfDay(range.from).toISOString())
          : undefined,
        [lteKey]: range.to
          ? (def.displayZone
              // Inclusive end-of-day (23:59:59.999) in the site zone, matching a
              // LESS_THAN_OR_EQUAL bound on the Instant column.
              ? serializeInstant(endOfDay(range.to), def.displayZone)
              : def.dateOnly
                ? toLocalDateString(range.to)
                // The browser zone's end of the picked day, so a one-day range is a day long.
                : endOfDay(range.to).toISOString())
          : undefined,
      });
    },
    [state, gteKey, lteKey, def.dateOnly, def.displayZone],
  );

  const handleClear = useCallback(() => {
    state.setValues({ [gteKey]: undefined, [lteKey]: undefined });
  }, [state, gteKey, lteKey]);

  return (
    <div className={cn("flex flex-col", className)} {...slotAttributes(crudFilterBarFieldStyle, {})}>
      <Flex align="center" justify="between">
        <Label>{def.label}</Label>
        {hasValue && (
          <Flex gap="xs" align="center">
            <span {...slotAttributes(crudFilterBarRangeTextStyle, {})}>{rangeText}</span>
            <FieldClearButton onClick={handleClear} label={def.label} />
          </Flex>
        )}
      </Flex>
      <div
        className="[&_div.flex>div]:flex-1 [&_header>span]:w-full [&_header>span]:h-6 [&_div.grid>button]:w-full [&_div.grid>button]:h-7 [&_div.grid>span]:w-full [&_div.grid>span]:h-7"
        {...slotAttributes(crudFilterBarCalendarStyle, {})}
      >
        <Calendar
          mode="range"
          selectedRange={{ from, to }}
          onSelectRange={handleRangeSelect}
          numberOfMonths={1}
          locale={locale}
          className="w-full"
        />
      </div>
    </div>
  );
}
