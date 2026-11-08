import { useCallback, useMemo } from "react";
import type { ComponentType } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import { CheckIcon, XIcon } from "../shared/icons";
import { Flex } from "../../primitives/flex";
import { Separator } from "../../base/display/separator";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { crudFieldClearButtonStyle } from "./field-clear-button.style";
import {
  crudFilterChipStyle,
  crudFilterChipTriggerStyle,
  crudFilterClearEntryStyle,
  crudFilterOptionCheckStyle,
  crudFilterOptionIconStyle,
} from "./filter-parts.style";

/**
 * A single option in a {@link FacetedFilter}.
 */
export interface FacetedFilterOption {
  /** Display label. */
  label: string;
  /** Unique value identifier. */
  value: string;
  /** Optional icon component rendered before the label. */
  icon?: ComponentType<{ className?: string }>;
}

/**
 * Props for the {@link FacetedFilter} component.
 */
export interface FacetedFilterProps {
  /** Button label (e.g. `"Status"`, `"Category"`). */
  label: string;
  /** Currently selected value(s). String for single-select, string array for multi-select. */
  value: string | string[];
  /** Called when selection changes. */
  onChange: (value: string | string[]) => void;
  /** Available filter options. */
  options: FacetedFilterOption[];
  /** Enable multi-select mode. Defaults to `true`. */
  multiSelect?: boolean;
  /** Max badges to show before collapsing to count. Defaults to `5`. */
  maxDisplayCount?: number;
  className?: string;
}

/**
 * Faceted filter with searchable command popover and badge display.
 *
 * ```
 * ┌─────────────────────────────────┐
 * │ Status | Active | Draft    [X]  │
 * └─────────────────────────────────┘
 *   └─ popover ───────────────────┐
 *   │ [Search...]                 │
 *   │ [x] Active                  │
 *   │ [x] Draft                   │
 *   │ [ ] Archived                │
 *   │ ─────────────               │
 *   │ Clear filters               │
 *   └────────────────────────────┘
 * ```
 *
 * @param props - {@link FacetedFilterProps}
 */
export function FacetedFilter({
  label,
  value,
  onChange,
  options,
  multiSelect = true,
  maxDisplayCount = 5,
  className,
}: FacetedFilterProps) {
  const { Badge, Popover, PopoverTrigger, PopoverContent, Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");
  const selectedValues = useMemo(
    () => new Set(Array.isArray(value) ? value : value ? [value] : []),
    [value],
  );

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (!multiSelect) {
        // Single select: toggle or set
        onChange(selectedValues.has(optionValue) ? "" : optionValue);
        return;
      }

      const next = new Set(selectedValues);
      if (next.has(optionValue)) {
        next.delete(optionValue);
      } else {
        next.add(optionValue);
      }
      onChange(next.size === 0 ? [] : [...next]);
    },
    [multiSelect, selectedValues, onChange],
  );

  const handleClear = useCallback(() => {
    onChange(multiSelect ? [] : "");
  }, [multiSelect, onChange]);

  const selectedCount = selectedValues.size;
  const selectedOptions = options.filter((o) => selectedValues.has(o.value));

  return (
    <Popover>
      {/* The chip's border is the wrapper's, so the trigger and the clear affordance sit side by
          side inside it rather than one inside the other — a control nested in a control leaves the
          keyboard and assistive technology to guess which of the two a press belongs to. */}
      <span
        className={cn("inline-flex h-8 items-center", className)}
        {...slotAttributes(crudFilterChipStyle, { filled: selectedCount > 0 })}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center"
            {...slotAttributes(crudFilterChipTriggerStyle, {})}
          >
            {label}
            {selectedCount > 0 && (
              <>
                <Separator orientation="vertical" className="h-4" />
                {/* Mobile: count only */}
                <Badge variant="secondary" className="sm:hidden">
                  {selectedCount}
                </Badge>
                {/* Desktop: labels or count */}
                <Flex gap="xs" className="hidden sm:flex">
                  {selectedCount <= maxDisplayCount ? (
                    selectedOptions.map((opt) => (
                      <Badge key={opt.value} variant="secondary">
                        {opt.label}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary">
                      {t("list.selected", { count: selectedCount })}
                    </Badge>
                  )}
                </Flex>
              </>
            )}
          </button>
        </PopoverTrigger>
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center"
            aria-label={t("filter.clearFilter")}
            {...slotAttributes(crudFieldClearButtonStyle, {})}
          >
            <XIcon className="h-3 w-3" />
          </button>
        )}
      </span>
      <PopoverContent flush className="w-50" align="start">
        <Command>
          <CommandInput placeholder={label} />
          <CommandList>
            <CommandEmpty>{t("filter.noResultsFound")}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
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
            {selectedCount > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={handleClear} className="justify-center">
                    <span {...slotAttributes(crudFilterClearEntryStyle, {})}>{t("filter.clearFilters")}</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
