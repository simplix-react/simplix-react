import { type ComponentType, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslation } from "@simplix-react/i18n/react";

import { Badge } from "../../base/badge";
import { Button } from "../../base/button";
import { Calendar, type DateRange } from "../../base/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../base/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../base/dropdown-menu";
import { Input } from "../../base/input";
import { Label } from "../../base/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../base/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../../base/select";
import { Switch } from "../../base/switch";
import { Flex } from "../../primitives/flex";
import { Stack } from "../../primitives/stack";
import { cn } from "../../utils/cn";
import { useCrudListColumns } from "../shared/column-context";
import { CheckIcon, ColumnsIcon, FunnelIcon, XIcon } from "../shared/icons";
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
}

export interface ToggleFilterDef extends FilterDefBase {
  type: "toggle";
}

export interface DateRangeFilterDef extends FilterDefBase {
  type: "dateRange";
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
  /** Max number of visible filter badges before collapsing into "+N". */
  maxBadges?: number;
  className?: string;
}

// ── Helper: format date for badge display ──

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

// ── FilterBar Component ──

export function FilterBar({ filters, state, leading, maxBadges, className }: FilterBarProps) {
  const { t } = useTranslation("simplix/ui");
  const locale = useLocale();
  const columnCtx = useCrudListColumns();
  const [open, setOpen] = useState(false);

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
          return ""; // handled separately
      }
    },
    [operators],
  );

  const isFilterActive = useCallback(
    (def: FilterDef): boolean => {
      if (def.type === "dateRange") {
        const gteKey = makeFilterKey(def.field, SearchOperator.GREATER_THAN_OR_EQUAL);
        const lteKey = makeFilterKey(def.field, SearchOperator.LESS_THAN_OR_EQUAL);
        return state.values[gteKey] != null || state.values[lteKey] != null;
      }
      if (def.type === "toggle") {
        return typeof state.values[getFilterKey(def)] === "boolean";
      }
      if (def.type === "faceted" || def.type === "country" || def.type === "timezone") {
        const val = state.values[getFilterKey(def)];
        return Array.isArray(val) && val.length > 0;
      }
      const val = state.values[getFilterKey(def)];
      return val != null && val !== "";
    },
    [state.values, getFilterKey],
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
      switch (def.type) {
        case "text": {
          return (state.values[getFilterKey(def)] as string) ?? "";
        }
        case "number": {
          return String(state.values[getFilterKey(def)] ?? "");
        }
        case "faceted": {
          const val = state.values[getFilterKey(def)] as string[];
          if (val.length <= 2) {
            return val
              .map((v) => def.options.find((o) => o.value === v)?.label ?? v)
              .join(", ");
          }
          return t("list.selected", { count: val.length });
        }
        case "country": {
          const val = state.values[getFilterKey(def)] as string[];
          if (val.length <= 2) {
            const displayNames = new Intl.DisplayNames([locale], { type: "region" });
            return val.map((v) => displayNames.of(v) ?? v).join(", ");
          }
          return t("list.selected", { count: val.length });
        }
        case "timezone": {
          const val = state.values[getFilterKey(def)] as string[];
          if (val.length <= 2) return val.join(", ");
          return t("list.selected", { count: val.length });
        }
        case "toggle": {
          const val = state.values[getFilterKey(def)] as boolean;
          return val ? t("common.yes") : t("common.no");
        }
        case "dateRange": {
          const gteKey = makeFilterKey(def.field, SearchOperator.GREATER_THAN_OR_EQUAL);
          const lteKey = makeFilterKey(def.field, SearchOperator.LESS_THAN_OR_EQUAL);
          const from = state.values[gteKey] ? new Date(state.values[gteKey] as string) : undefined;
          const to = state.values[lteKey] ? new Date(state.values[lteKey] as string) : undefined;
          if (from && to) return `${formatDate(from)} \u2013 ${formatDate(to)}`;
          if (from) return `${formatDate(from)} \u2013 ...`;
          if (to) return `... \u2013 ${formatDate(to)}`;
          return "";
        }
      }
    },
    [state.values, getFilterKey, operators, locale],
  );

  const removeFilter = useCallback(
    (def: FilterDef) => {
      if (def.type === "dateRange") {
        const gteKey = makeFilterKey(def.field, SearchOperator.GREATER_THAN_OR_EQUAL);
        const lteKey = makeFilterKey(def.field, SearchOperator.LESS_THAN_OR_EQUAL);
        state.setValues({ [gteKey]: undefined, [lteKey]: undefined });
        return;
      }
      state.setValue(getFilterKey(def), undefined);
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

  return (
    <Flex
      gap="xs"
      align="center"
      wrap
      justify={leading ? "between" : "end"}
      className={cn("w-full", className)}
    >
      {leading}
      <Flex gap="xs" align="center" wrap>
      {visibleDefs.map((def) => {
        const BadgeIcon = getBadgeIcon(def);
        return (
          <Badge
            key={def.field}
            variant="secondary"
            className="h-7 max-w-[12rem] gap-1 pl-2 pr-1 text-xs font-normal"
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
        <Badge variant="secondary" className="h-7 px-2 text-xs font-normal">
          +{hiddenCount}
        </Badge>
      )}
      <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="xs" className="gap-1.5">
              <FunnelIcon className="h-3 w-3" />
              {t("filter.label")}
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-0.5 h-4 min-w-[1rem] justify-center px-1 text-[10px] font-normal leading-none">
                  {activeDefs.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="flex max-h-[min(70vh,var(--radix-popover-content-available-height,70vh))] w-[320px] flex-col p-0"
            align="end"
            collisionPadding={16}
          >
            <Stack gap="none" className="flex-1 overflow-y-auto p-4">
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
            </Stack>
            <Flex justify="end" gap="xs" className="border-t p-3">
              <Button variant="ghost" size="sm" onClick={clearAll} disabled={!hasActiveFilters}>
                {t("common.clear")}
              </Button>
              <Button size="sm" onClick={() => { state.apply(); setOpen(false); }}>
                {t("filter.apply")}
              </Button>
            </Flex>
          </PopoverContent>
        </Popover>
        {columnCtx && columnCtx.columns.length > 0 && !columnCtx.isCardMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="xs" className="h-7 w-7 p-0" aria-label="Toggle columns">
                <ColumnsIcon className="h-3.5 w-3.5" />
              </Button>
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
  const currentOp = operators[def.field] ?? def.defaultOperator;
  const key = makeFilterKey(def.field, currentOp);
  const value = (state.values[key] as string) ?? "";

  return (
    <Stack gap="xs" className={className}>
      <Flex align="center" justify="between">
        <Label className="text-xs font-medium text-muted-foreground">{def.label}</Label>
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
        <Label className="text-xs font-medium text-muted-foreground">{def.label}</Label>
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
  const { t } = useTranslation("simplix/ui");
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

  return (
    <Stack gap="xs" className={className}>
      <Flex align="center" justify="between">
        <Label className="text-xs font-medium text-muted-foreground">{def.label}</Label>
        {selectedValues.size > 0 && <FieldClearButton onClick={() => state.setValue(key, undefined)} label={def.label} />}
      </Flex>
      {def.options.length > 0 ? (
        <Command className="rounded-md border">
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
  const key = makeFilterKey(def.field, SearchOperator.EQUALS);
  const rawValue = state.values[key];
  const checked = typeof rawValue === "boolean" ? rawValue : false;
  const isActive = typeof rawValue === "boolean";

  return (
    <Flex align="center" justify="between" className={cn("py-1", className)}>
      <Label className="text-xs font-medium text-muted-foreground">{def.label}</Label>
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
  const gteKey = makeFilterKey(def.field, SearchOperator.GREATER_THAN_OR_EQUAL);
  const lteKey = makeFilterKey(def.field, SearchOperator.LESS_THAN_OR_EQUAL);
  const from = state.values[gteKey] ? new Date(state.values[gteKey] as string) : undefined;
  const to = state.values[lteKey] ? new Date(state.values[lteKey] as string) : undefined;
  const hasValue = from || to;

  const rangeText = useMemo(() => {
    if (from && to) return `${formatDate(from)} \u2013 ${formatDate(to)}`;
    if (from) return `${formatDate(from)} \u2013 ...`;
    if (to) return `... \u2013 ${formatDate(to)}`;
    return null;
  }, [from, to]);

  const handleRangeSelect = useCallback(
    (range: DateRange) => {
      state.setValues({
        [gteKey]: range.from?.toISOString(),
        [lteKey]: range.to?.toISOString(),
      });
    },
    [state, gteKey, lteKey],
  );

  const handleClear = useCallback(() => {
    state.setValues({ [gteKey]: undefined, [lteKey]: undefined });
  }, [state, gteKey, lteKey]);

  return (
    <Stack gap="xs" className={className}>
      <Flex align="center" justify="between">
        <Label className="text-xs font-medium text-muted-foreground">{def.label}</Label>
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
          className="w-full p-2"
        />
      </div>
    </Stack>
  );
}
