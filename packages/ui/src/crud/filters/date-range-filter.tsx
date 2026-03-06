import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { cn } from "../../utils/cn";
import { CalendarDotsIcon, XIcon } from "../shared/icons";
import { Badge } from "../../base/display/badge";
import { Separator } from "../../base/display/separator";
import { Popover, PopoverContent, PopoverTrigger } from "../../base/overlay/popover";
import { Calendar, type DateRange } from "../../base/controls/calendar";

/**
 * Props for the {@link DateRangeFilter} component.
 */
export interface DateRangeFilterProps {
  /** Button label (e.g. `"Created"`, `"Updated"`). */
  label: string;
  /** Start date of the range, or `undefined` if unset. */
  from: Date | undefined;
  /** End date of the range, or `undefined` if unset. */
  to: Date | undefined;
  /** Called when the user selects or clears a date range. */
  onChange: (from?: Date, to?: Date) => void;
  className?: string;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Date range filter with dual-month calendar popover.
 *
 * ```
 * ┌──────────────────────────────────────┐
 * │ [cal] Created | Jan 1 – Jan 31 [X]  │
 * └──────────────────────────────────────┘
 *   └─ popover ─────────────────────────┐
 *   │  [  January  ]  [  February  ]    │
 *   │  Mo Tu We Th Fr  Mo Tu We Th Fr   │
 *   │  ...              ...             │
 *   └──────────────────────────────────┘
 * ```
 *
 * @param props - {@link DateRangeFilterProps}
 */
export function DateRangeFilter({
  label,
  from,
  to,
  onChange,
  className,
}: DateRangeFilterProps) {
  const { t } = useTranslation("simplix/ui");
  const [open, setOpen] = useState(false);

  const handleRangeSelect = useCallback(
    (range: DateRange) => {
      onChange(range.from, range.to);
      if (range.from && range.to) {
        setOpen(false);
      }
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange(undefined, undefined);
    setOpen(false);
  }, [onChange]);

  const hasValue = from || to;

  const rangeText = useMemo(() => {
    if (from && to) return `${formatDate(from)} – ${formatDate(to)}`;
    if (from) return `${formatDate(from)} – ...`;
    return "–";
  }, [from, to]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-sm",
            hasValue ? "border-solid" : "border-dashed text-muted-foreground",
            className,
          )}
        >
          <CalendarDotsIcon className="h-4 w-4" />
          {label}
          <Separator
            orientation="vertical"
            className={cn("mx-1 h-4", !hasValue && "opacity-0")}
          />
          <Badge
            variant="secondary"
            className={cn(
              "w-[9.5rem] justify-center font-normal",
              !hasValue && "opacity-0",
            )}
          >
            {rangeText}
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
            aria-label={t("filter.clearDateRange")}
          >
            <XIcon className="h-3 w-3" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selectedRange={{ from, to }}
          onSelectRange={handleRangeSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
