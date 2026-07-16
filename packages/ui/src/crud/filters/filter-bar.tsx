import { type ComponentType, Fragment, type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslation } from "@simplix-react/i18n/react";

import type { DateRange } from "../../base/controls/calendar";
import { FieldChevron } from "../../base/inputs/field-chevron";
import { Flex } from "../../primitives/flex";
import { Stack } from "../../primitives/stack";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { endOfDay, startOfDay } from "../../utils/date-math";
import { formatDateRange, toLocalDateString } from "../../utils/format-date";
import { parseDate } from "../../utils/parse-date";
import { decodeInstant, serializeInstant } from "../../utils/rfc3339-date";
import { useCrudListColumns } from "../shared/column-context";
import { ListTotalBadge } from "../shared/list-total-badge";
import { CheckIcon, ColumnsIcon, EyeIcon, FunnelIcon, LayoutGridIcon, RowsIcon, XIcon } from "../shared/icons";
import { CountryFormField } from "./country-form-field";
import { FieldClearButton } from "./field-clear-button";
import { operatorConfig } from "./filter-icons";
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

export interface TextFilterDef extends FilterDefBase {
  type: "text";
  operators: SearchOperator[];
  defaultOperator: SearchOperator;
  placeholder?: string;
}

export interface NumberFilterDef extends FilterDefBase {
  type: "number";
  operators: SearchOperator[];
  defaultOperator: SearchOperator;
  placeholder?: string;
}

export interface FacetedFilterDef extends FilterDefBase {
  type: "faceted";
  options: Array<{ value: string; label: string; icon?: ComponentType<{ className?: string }> }>;
  multiSelect?: boolean;
  /**
   * Presentation of the option list. "list" (default) renders the searchable
   * checkbox list inline; "dropdown" collapses it behind a combobox-style
   * trigger — use for long option sets such as entity/user pickers.
   */
  display?: "list" | "dropdown";
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

export function FilterBar({ filters, state, leading, trailing, maxBadges, onPreview, previewLabel, count, popoverColumns = "auto", className }: FilterBarProps) {
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
          return (vals[getFilterKey(def)] as string) ?? "";
        }
        case "number": {
          return String(vals[getFilterKey(def)] ?? "");
        }
        case "faceted": {
          const val = vals[getFilterKey(def)] as string[];
          if (val.length <= 2) {
            return val
              .map((v) => def.options.find((o) => o.value === v)?.label ?? v)
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

  const showCount = count != null;
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
    >
      {hasLeadingGroup && (
        <Flex gap="xs" align="center" wrap>
          {showCount && <ListTotalBadge count={count!} />}
          {leading}
          {showViewToggle && (
            <div
              role="group"
              aria-label={t("filter.label")}
              className="box-border inline-flex h-8 items-center rounded-md border border-input bg-card p-0.5"
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
                    className={cn(
                      "inline-grid h-full w-7 place-items-center rounded transition-colors",
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>
          )}
          {onPreview && (
            <Button variant="outline" size="sm" className="gap-1.5 font-semibold" onClick={onPreview}>
              <EyeIcon className="h-3.5 w-3.5" />
              {previewLabel ?? t("list.preview")}
            </Button>
          )}
        </Flex>
      )}
      <Flex gap="xs" align="center" wrap>
      {visibleDefs.map((def) => {
        const BadgeIcon = getBadgeIcon(def);
        return (
          <Badge
            key={def.field}
            variant="secondary"
            className="h-8 max-w-[12rem] gap-1 rounded-md border-input pl-2 pr-1 text-xs font-normal"
          >
            <span className="shrink-0 text-muted-foreground">{def.label}:</span>
            {BadgeIcon && <BadgeIcon className="h-3 w-3 shrink-0 text-muted-foreground" />}
            <span className="truncate">{getBadgeText(def)}</span>
            <button
              type="button"
              onClick={() => removeFilter(def)}
              className="ml-0.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
              aria-label={`Remove ${def.label} filter`}
            >
              <XIcon className="h-2.5 w-2.5" />
            </button>
          </Badge>
        );
      })}
      {hiddenCount > 0 && (
        <Badge variant="secondary" className="h-8 rounded-md border-input px-2 text-xs font-normal">
          +{hiddenCount}
        </Badge>
      )}
      {trailing}
      {/* Segmented group: filter trigger + columns toggle, styled like the view toggle. */}
      <div className="box-border inline-flex h-8 items-center gap-0.5 rounded-md border border-input bg-card p-0.5">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={t("filter.label")}
              title={t("filter.label")}
              className={cn(
                "inline-flex h-full items-center gap-1.5 rounded px-2 text-sm transition-colors hover:bg-muted [&_svg]:size-3.5",
                hasActiveFilters ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <FunnelIcon className="h-3.5 w-3.5" />
              <span>{t("filter.label")}</span>
              {hasActiveFilters && (
                <Badge className="h-4 min-w-[1rem] justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                  {activeDefs.length}
                </Badge>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            className={cn(
              "flex max-h-[min(70vh,var(--radix-popover-content-available-height,70vh))] flex-col p-0",
              columnCount === 3 ? "w-[800px]" : twoColumn ? "w-[560px]" : "w-[320px]",
            )}
            align="end"
            collisionPadding={16}
          >
            <Flex align="center" justify="between" className="border-b px-4 py-2.5">
              <span className="text-sm font-bold">{t("filter.label")}</span>
              <Flex gap="xs" align="center">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearAll} disabled={!hasActiveFilters && !state.isPending}>
                  {t("common.clear")}
                </Button>
                <Button size="sm" className="h-7 px-3 text-xs" disabled={!state.isPending} onClick={() => { state.apply(); setOpen(false); }}>
                  {t("filter.apply")}
                </Button>
              </Flex>
            </Flex>
            <div ref={fieldsRef} className="flex-1 overflow-y-auto p-4">
              {twoColumn ? (
                // Two fully independent columns: fields are split column-major in JS and
                // each column is its own flex stack, so a tall field (e.g. a calendar)
                // neither stretches its horizontal neighbor nor gets fragmented the way
                // CSS multi-column would fragment it.
                <Flex gap="lg" align="stretch">
                  {splitFilterColumns(filters, columnCount).map((column, c) => (
                    <Fragment key={c}>
                      {c > 0 && <div aria-hidden className="w-px self-stretch bg-border" />}
                      <div className="flex min-w-0 flex-1 flex-col">
                        {column.map((def, i) => (
                          <FilterFormField
                            key={def.field}
                            def={def}
                            state={state}
                            operators={operators}
                            onOperatorChange={handleOperatorChange}
                            className={i > 0 ? "mt-4" : undefined}
                          />
                        ))}
                      </div>
                    </Fragment>
                  ))}
                </Flex>
              ) : (
                <div className="flex flex-col">
                  {filters.map((def, i) => (
                    <FilterFormField
                      key={def.field}
                      def={def}
                      state={state}
                      operators={operators}
                      onOperatorChange={handleOperatorChange}
                      className={i > 0 ? "mt-4" : undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        {showColumnsToggle && <span aria-hidden className="mx-0.5 h-4 w-px bg-border" />}
        {showColumnsToggle && columnCtx && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Toggle columns"
                className="inline-grid h-full w-7 place-items-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
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
      </Flex>
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
      <SelectTrigger className="h-8 w-8 shrink-0 justify-center border bg-muted/50 px-0 text-muted-foreground [&>svg]:hidden" aria-label={t("filter.selectOperator")}>
        <span className="flex items-center justify-center">
          <meta.icon className="h-3.5 w-3.5" />
        </span>
      </SelectTrigger>
      <SelectContent>
        {operators.map((op) => {
          const opMeta = operatorConfig[op];
          return (
            <SelectItem key={op} value={op}>
              <span className="flex items-center gap-1.5">
                <opMeta.icon className="h-3.5 w-3.5" />
                <span className="text-xs">{t(opMeta.labelKey)}</span>
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
  const { Input, Label } = useFlatUIComponents();
  const currentOp = operators[def.field] ?? def.defaultOperator;
  const key = makeFilterKey(def.field, currentOp);
  const value = (state.values[key] as string) ?? "";

  return (
    <Stack gap="xs" className={className}>
      <Flex align="center" justify="between">
        <Label className="text-sm font-medium text-secondary-foreground">{def.label}</Label>
        {value && <FieldClearButton onClick={() => state.setValue(key, undefined)} label={def.label} />}
      </Flex>
      <Flex gap="xs" align="center">
        <OperatorIcon
          operators={def.operators}
          currentOp={currentOp}
          onOperatorChange={(op) => onOperatorChange(def, op)}
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => state.setValue(key, e.target.value || undefined)}
          placeholder={def.placeholder ?? def.label}
          className="h-8 flex-1 text-sm"
        />
      </Flex>
    </Stack>
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
    <Stack gap="xs" className={className}>
      <Flex align="center" justify="between">
        <Label className="text-sm font-medium text-secondary-foreground">{def.label}</Label>
        {rawValue != null && <FieldClearButton onClick={handleClear} label={def.label} />}
      </Flex>
      <Flex gap="xs" align="center">
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
          className="h-8 flex-1 text-sm"
        />
      </Flex>
    </Stack>
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

  const optionList = (
    <Command className={def.display === "dropdown" ? "rounded-md" : "rounded-md border"}>
      <CommandInput placeholder={def.label} className="h-8" />
      <CommandList className="max-h-[160px]">
        <CommandEmpty>{t("filter.noResultsFound")}</CommandEmpty>
        <CommandGroup>
          {def.options.map((option) => {
            const isSelected = selectedValues.has(option.value);
            return (
              <CommandItem
                key={option.value}
                onSelect={() => handleSelect(option.value)}
              >
                <span
                  className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "opacity-50 [&_svg]:invisible",
                  )}
                >
                  <CheckIcon className="h-3 w-3" />
                </span>
                {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                <span>{option.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  if (def.display === "dropdown") {
    const selectedLabels = def.options
      .filter((option) => selectedValues.has(option.value))
      .map((option) => option.label);

    return (
      <Stack gap="xs" className={className}>
        <Flex align="center" justify="between">
          <Label className="text-sm font-medium text-secondary-foreground">{def.label}</Label>
          {selectedValues.size > 0 && <FieldClearButton onClick={() => state.setValue(key, undefined)} label={def.label} />}
        </Flex>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-8 w-full items-center gap-1 rounded-md border border-input bg-background px-3 text-sm focus:border-foreground focus:outline-none"
            >
              <span className={cn("flex-1 truncate text-left", selectedValues.size === 0 && "text-muted-foreground")}>
                {selectedValues.size > 0 ? selectedLabels.join(", ") : t("field.selectOption")}
              </span>
              <FieldChevron />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
            onOpenAutoFocus={(e: Event) => e.preventDefault()}
          >
            {optionList}
          </PopoverContent>
        </Popover>
      </Stack>
    );
  }

  return (
    <Stack gap="xs" className={className}>
      <Flex align="center" justify="between">
        <Label className="text-sm font-medium text-secondary-foreground">{def.label}</Label>
        {selectedValues.size > 0 && <FieldClearButton onClick={() => state.setValue(key, undefined)} label={def.label} />}
      </Flex>
      {def.options.length > 0 ? (
        optionList
      ) : (
        <span className="text-xs text-muted-foreground">No options available</span>
      )}
    </Stack>
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
    <Flex align="center" justify="between" className={cn("py-1", className)}>
      <Label className="text-sm font-medium text-secondary-foreground">{def.label}</Label>
      <Flex align="center" gap="xs">
        {isActive && <FieldClearButton onClick={() => state.setValue(key, undefined)} label={def.label} />}
        <Switch
          checked={checked}
          onCheckedChange={(v) => state.setValue(key, v)}
        />
      </Flex>
    </Flex>
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
                : range.from.toISOString())
          : undefined,
        [lteKey]: range.to
          ? (def.displayZone
              // Inclusive end-of-day (23:59:59.999) in the site zone, matching a
              // LESS_THAN_OR_EQUAL bound on the Instant column.
              ? serializeInstant(endOfDay(range.to), def.displayZone)
              : def.dateOnly
                ? toLocalDateString(range.to)
                : range.to.toISOString())
          : undefined,
      });
    },
    [state, gteKey, lteKey, def.dateOnly, def.displayZone],
  );

  const handleClear = useCallback(() => {
    state.setValues({ [gteKey]: undefined, [lteKey]: undefined });
  }, [state, gteKey, lteKey]);

  return (
    <Stack gap="xs" className={className}>
      <Flex align="center" justify="between">
        <Label className="text-sm font-medium text-secondary-foreground">{def.label}</Label>
        {hasValue && (
          <Flex gap="xs" align="center">
            <span className="text-xs text-foreground">{rangeText}</span>
            <FieldClearButton onClick={handleClear} label={def.label} />
          </Flex>
        )}
      </Flex>
      <div className="rounded-md border [&_div.flex>div]:flex-1 [&_header>span]:w-full [&_header>span]:h-6 [&_div.grid>button]:w-full [&_div.grid>button]:h-7 [&_div.grid>button]:text-xs [&_div.grid>span]:w-full [&_div.grid>span]:h-7 [&_nav]:pb-1">
        <Calendar
          mode="range"
          selectedRange={{ from, to }}
          onSelectRange={handleRangeSelect}
          numberOfMonths={1}
          locale={locale}
          className="w-full p-2"
        />
      </div>
    </Stack>
  );
}
