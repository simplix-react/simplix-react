import { useCallback, useMemo } from "react";
import type { ComponentType } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import { CheckIcon, CaretDownIcon, XIcon } from "../shared/icons";
import { Flex } from "../../primitives/flex";
import { Separator } from "../../base/display/separator";
import { useFlatUIComponents } from "../../provider/ui-provider";
import type { SearchOperator } from "./filter-types";
import { selectOperatorConfig } from "./filter-types";
import { crudFieldClearButtonStyle } from "./field-clear-button.style";
import { operatorConfig } from "./filter-icons";
import {
  crudFilterChipStyle,
  crudFilterChipTriggerStyle,
  crudFilterClearEntryStyle,
  crudFilterOperatorMenuStyle,
  crudFilterOperatorTriggerStyle,
  crudFilterOptionCheckStyle,
  crudFilterOptionIconStyle,
} from "./filter-parts.style";

export interface AdvancedSelectFilterOption {
  label: string;
  value: string;
  icon?: ComponentType<{ className?: string }>;
}

export interface AdvancedSelectFilterProps {
  label?: string;
  value: string | string[];
  operator: SearchOperator;
  onChange: (value: string | string[]) => void;
  onOperatorChange: (operator: SearchOperator) => void;
  operators: SearchOperator[];
  defaultOperator?: SearchOperator;
  options: AdvancedSelectFilterOption[];
  maxDisplayCount?: number;
  className?: string;
}

export function AdvancedSelectFilter({
  label,
  value,
  operator,
  onChange,
  onOperatorChange,
  operators,
  options,
  maxDisplayCount = 5,
  className,
}: AdvancedSelectFilterProps) {
  const { Badge, Popover, PopoverTrigger, PopoverContent, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");
  const allowMultiple = selectOperatorConfig[operator]?.allowMultiple ?? false;
  const currentOp = operatorConfig[operator];

  const selectedValues = useMemo(
    () => new Set(Array.isArray(value) ? value : value ? [value] : []),
    [value],
  );

  const handleOperatorChange = useCallback(
    (newOp: SearchOperator) => {
      onOperatorChange(newOp);
      // Reset value on operator change
      const newAllowMultiple = selectOperatorConfig[newOp]?.allowMultiple ?? false;
      onChange(newAllowMultiple ? [] : "");
    },
    [onOperatorChange, onChange],
  );

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (!allowMultiple) {
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
    [allowMultiple, selectedValues, onChange],
  );

  const handleClear = useCallback(() => {
    onChange(allowMultiple ? [] : "");
  }, [allowMultiple, onChange]);

  const selectedCount = selectedValues.size;
  const selectedOptions = options.filter((o) => selectedValues.has(o.value));

  return (
    <Flex align="center" gap="xs" className={cn(className)}>
      {operators.length > 1 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-8 items-center"
              aria-label={t("filter.selectOperator")}
              {...slotAttributes(crudFilterOperatorTriggerStyle, { attach: "chip" })}
            >
              <currentOp.icon className="h-3.5 w-3.5" />
              <CaretDownIcon className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <div {...slotAttributes(crudFilterOperatorMenuStyle, {})}>
              {operators.map((op) => {
                const meta = operatorConfig[op];
                const opAllowMultiple = selectOperatorConfig[op]?.allowMultiple ?? false;
                return (
                  <DropdownMenuItem
                    key={op}
                    onClick={() => handleOperatorChange(op)}
                    data-current={op === operator}
                  >
                    <meta.icon className="h-3.5 w-3.5" />
                    {t(meta.labelKey)}
                    {opAllowMultiple && <Badge variant="outline">Multiple</Badge>}
                  </DropdownMenuItem>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <Popover>
        {/* The chip's border is the wrapper's, so the trigger and the clear affordance sit side by
            side inside it rather than one inside the other — a control nested in a control leaves
            the keyboard and assistive technology to guess which of the two a press belongs to. */}
        <span
          className="inline-flex h-8 items-center"
          {...slotAttributes(crudFilterChipStyle, { filled: selectedCount > 0 })}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center"
              {...slotAttributes(crudFilterChipTriggerStyle, {})}
            >
              {label ?? t(currentOp.labelKey)}
              {selectedCount > 0 && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  {selectedCount <= maxDisplayCount ? (
                    <Flex gap="xs">
                      {selectedOptions.map((opt) => (
                        <Badge key={opt.value} variant="secondary">
                          {opt.label}
                        </Badge>
                      ))}
                    </Flex>
                  ) : (
                    <Badge variant="secondary">
                      {t("list.selected", { count: selectedCount })}
                    </Badge>
                  )}
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
              {...slotAttributes(crudFieldClearButtonStyle, { ring: true })}
            >
              <XIcon className="h-3 w-3" />
            </button>
          )}
        </span>
        <PopoverContent flush className="w-[200px]" align="start">
          <Command>
            <CommandInput placeholder={`Search ${label ?? ""}...`} />
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
    </Flex>
  );
}
