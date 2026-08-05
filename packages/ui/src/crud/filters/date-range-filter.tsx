import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { cn } from "../../utils/cn";
import { formatDateRange } from "../../utils/format-date";
import { CalendarDotsIcon, XIcon } from "../shared/icons";
import type { DateRange } from "../../base/controls/calendar";
import { Separator } from "../../base/display/separator";
import { useFlatUIComponents } from "../../provider/ui-provider";

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
  const { Badge, Calendar, Popover, PopoverTrigger, PopoverContent } = useFlatUIComponents();
  const { t, locale: i18nLocale } = useTranslation("simplix/ui");
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

  const rangeText = useMemo(
    () => formatDateRange(from, to, i18nLocale) ?? "–",
    [from, to, i18nLocale],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* The chip's border is the wrapper's, so the trigger and the clear affordance sit side by
          side inside it rather than one inside the other — a control nested in a control leaves the
          keyboard and assistive technology to guess which of the two a press belongs to. */}
      <span
        className={cn(
          "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-sm",
          hasValue ? "border-solid" : "border-dashed text-muted-foreground",
          className,
        )}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <CalendarDotsIcon className="h-4 w-4" />
            {label}
          </button>
        </PopoverTrigger>
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
        <button
          type="button"
          tabIndex={hasValue ? 0 : -1}
          onClick={handleClear}
          className={cn(
            "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            !hasValue && "pointer-events-none opacity-0",
          )}
          aria-label={t("filter.clearDateRange")}
        >
          <XIcon className="h-3 w-3" />
        </button>
      </span>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selectedRange={{ from, to }}
          onSelectRange={handleRangeSelect}
          numberOfMonths={2}
          locale={i18nLocale}
        />
      </PopoverContent>
    </Popover>
  );
}
