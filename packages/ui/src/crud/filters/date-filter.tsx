import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { cn } from "../../utils/cn";
import { formatDateMedium, formatDateRange } from "../../utils/format-date";
import { CalendarDotIcon, CalendarDotsIcon, XIcon, CaretDownIcon } from "../shared/icons";
import { Flex } from "../../primitives/flex";
import type { DateRange } from "../../base/controls/calendar";
import { Separator } from "../../base/display/separator";
import { useFlatUIComponents } from "../../provider/ui-provider";
import type { SearchOperator } from "./filter-types";
import { dateOperatorConfig } from "./filter-types";
import { operatorConfig } from "./filter-icons";

export interface DateFilterProps {
  label?: string;
  value: Date | DateRange | undefined;
  operator: SearchOperator;
  onChange: (value: Date | DateRange | undefined) => void;
  onOperatorChange: (operator: SearchOperator) => void;
  operators: SearchOperator[];
  defaultOperator?: SearchOperator;
  className?: string;
}


export function DateFilter({
  label,
  value,
  operator,
  onChange,
  onOperatorChange,
  operators,
  className,
}: DateFilterProps) {
  const { Badge, Calendar, Popover, PopoverTrigger, PopoverContent, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } = useFlatUIComponents();
  const { t, locale: i18nLocale } = useTranslation("simplix/ui");
  const [open, setOpen] = useState(false);
  const isRange = dateOperatorConfig[operator]?.requiresRange ?? false;
  const currentOp = operatorConfig[operator];
  const Icon = isRange ? CalendarDotsIcon : CalendarDotIcon;

  const handleOperatorChange = useCallback(
    (newOp: SearchOperator) => {
      const newIsRange = dateOperatorConfig[newOp]?.requiresRange ?? false;
      const oldIsRange = dateOperatorConfig[operator]?.requiresRange ?? false;

      onOperatorChange(newOp);

      // Reset value when switching between single and range
      if (newIsRange !== oldIsRange) {
        onChange(undefined);
      }
    },
    [operator, onOperatorChange, onChange],
  );

  const handleSingleSelect = useCallback(
    (date: Date) => {
      onChange(date);
      setOpen(false);
    },
    [onChange],
  );

  const handleRangeSelect = useCallback(
    (range: DateRange) => {
      onChange(range);
      if (range.from && range.to) {
        setOpen(false);
      }
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange(undefined);
    setOpen(false);
  }, [onChange]);

  // Display text
  const displayText = useMemo(() => {
    if (!value) return null;
    if (value instanceof Date) return formatDateMedium(value, i18nLocale);
    const range = value as DateRange;
    return formatDateRange(range.from, range.to, i18nLocale);
  }, [value, i18nLocale]);

  const hasValue = !!displayText;

  // Calendar props
  const calendarProps = isRange
    ? {
        mode: "range" as const,
        selectedRange: (value && !(value instanceof Date) ? value : { from: undefined, to: undefined }) as DateRange,
        onSelectRange: handleRangeSelect,
        numberOfMonths: 2,
        locale: i18nLocale,
      }
    : {
        mode: "single" as const,
        selected: value instanceof Date ? value : undefined,
        onSelect: handleSingleSelect,
        locale: i18nLocale,
      };

  const badgeWidth = isRange ? "w-[13rem]" : "w-[7rem]";

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
              const opIsRange = dateOperatorConfig[op]?.requiresRange ?? false;
              return (
                <DropdownMenuItem
                  key={op}
                  onClick={() => handleOperatorChange(op)}
                  className={cn(op === operator && "bg-accent")}
                >
                  <meta.icon className="mr-2 h-3.5 w-3.5" />
                  {t(meta.labelKey)}
                  {opIsRange && (
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      Range
                    </Badge>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-sm",
              hasValue ? "border-solid" : "border-dashed text-muted-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label ?? "Pick a date"}
            <Separator
              orientation="vertical"
              className={cn("mx-1 h-4", !hasValue && "opacity-0")}
            />
            <Badge
              variant="secondary"
              className={cn(
                badgeWidth,
                "justify-center font-normal",
                !hasValue && "opacity-0",
              )}
            >
              {displayText ?? "–"}
            </Badge>
            <span
              role="button"
              tabIndex={hasValue ? 0 : -1}
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
              className={cn(
                "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground",
                !hasValue && "pointer-events-none opacity-0",
              )}
              aria-label={t("filter.clearDate")}
            >
              <XIcon className="h-3 w-3" />
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar {...calendarProps} />
        </PopoverContent>
      </Popover>
    </Flex>
  );
}
