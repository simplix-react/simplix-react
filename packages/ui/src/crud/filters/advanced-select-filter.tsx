import { useCallback, useMemo } from "react";
import type { ComponentType } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { cn } from "../../utils/cn";
import { CheckIcon, CaretDownIcon, XIcon } from "../shared/icons";
import { Flex } from "../../primitives/flex";
import { Separator } from "../../base/display/separator";
import { useFlatUIComponents } from "../../provider/ui-provider";
import type { SearchOperator } from "./filter-types";
import { selectOperatorConfig } from "./filter-types";
import { operatorConfig } from "./filter-icons";

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
              className="inline-flex h-8 items-center gap-0.5 rounded-md border bg-muted/50 px-2 text-muted-foreground hover:text-foreground"
              aria-label={t("filter.selectOperator")}
            >
              <currentOp.icon className="h-3.5 w-3.5" />
              <CaretDownIcon className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {operators.map((op) => {
              const meta = operatorConfig[op];
              const opAllowMultiple = selectOperatorConfig[op]?.allowMultiple ?? false;
              return (
                <DropdownMenuItem
                  key={op}
                  onClick={() => handleOperatorChange(op)}
                  className={cn(op === operator && "bg-accent")}
                >
                  <meta.icon className="mr-2 h-3.5 w-3.5" />
                  {t(meta.labelKey)}
                  {opAllowMultiple && (
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      Multiple
                    </Badge>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-sm",
              selectedCount > 0 ? "border-solid" : "border-dashed text-muted-foreground",
            )}
          >
            {label ?? t(currentOp.labelKey)}
            {selectedCount > 0 && (
              <>
                <Separator orientation="vertical" className="mx-1 h-4" />
                {selectedCount <= maxDisplayCount ? (
                  <Flex gap="xs">
                    {selectedOptions.map((opt) => (
                      <Badge key={opt.value} variant="secondary" className="font-normal">
                        {opt.label}
                      </Badge>
                    ))}
                  </Flex>
                ) : (
                  <Badge variant="secondary" className="font-normal">
                    {t("list.selected", { count: selectedCount })}
                  </Badge>
                )}
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
    </Flex>
  );
}
