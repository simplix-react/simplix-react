import { useCallback, useMemo } from "react";
import type { ComponentType } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { cn } from "../../utils/cn";
import { CheckIcon, XIcon } from "../shared/icons";
import { Flex } from "../../primitives/flex";
import { Separator } from "../../base/display/separator";
import { useFlatUIComponents } from "../../provider/ui-provider";

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
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-sm",
            selectedCount > 0 ? "border-solid" : "border-dashed text-muted-foreground",
            className,
          )}
        >
          {label}
          {selectedCount > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              {/* Mobile: count only */}
              <Badge variant="secondary" className="font-normal sm:hidden">
                {selectedCount}
              </Badge>
              {/* Desktop: labels or count */}
              <Flex gap="xs" className="hidden sm:flex">
                {selectedCount <= maxDisplayCount ? (
                  selectedOptions.map((opt) => (
                    <Badge key={opt.value} variant="secondary" className="font-normal">
                      {opt.label}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary" className="font-normal">
                    {t("list.selected", { count: selectedCount })}
                  </Badge>
                )}
              </Flex>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    e.preventDefault();
                    handleClear();
                  }
                }}
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                aria-label={t("filter.clearFilter")}
              >
                <XIcon className="h-3 w-3" />
              </span>
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
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
            {selectedCount > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClear}
                    className="justify-center text-center"
                  >
                    {t("filter.clearFilters")}
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
