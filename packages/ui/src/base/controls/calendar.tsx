import { type ComponentPropsWithRef, forwardRef, useMemo, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { cn } from "../../utils/cn";
import {
  endOfWeek as endOfWeekFn,
  isSameDay,
  isSameWeek,
  startOfWeek as startOfWeekFn,
} from "../../utils/date-math";
import { getMonthNames } from "../../utils/format-date";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface CalendarProps
  extends Omit<ComponentPropsWithRef<"div">, "onSelect"> {
  selected?: Date;
  onSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  mode?: "single" | "range" | "week" | "month";
  selectedRange?: DateRange;
  onSelectRange?: (range: DateRange) => void;
  numberOfMonths?: number;
  /** BCP 47 locale tag for weekday/month names (e.g. `"ko-KR"`). Defaults to browser locale. */
  locale?: string;
  /** Controlled displayed month. When set, the calendar shows this month. */
  month?: Date;
  /** Callback when the displayed month changes (controlled mode). */
  onMonthChange?: (date: Date) => void;
  /** Hide built-in prev/next navigation (for parent-controlled navigation). */
  hideNavigation?: boolean;
  /** Hide month/year header row. */
  hideHeader?: boolean;
}

function getWeekdayNames(locale?: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  // 2024-01-07 is a Sunday
  return Array.from({ length: 7 }, (_, i) =>
    formatter.format(new Date(2024, 0, 7 + i)).slice(0, 2),
  );
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isDateDisabled(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
): boolean {
  if (minDate && date < minDate) return true;
  if (maxDate && date > maxDate) return true;
  return false;
}

function isInRange(date: Date, from: Date | undefined, to: Date | undefined): boolean {
  if (!from || !to) return false;
  return date > from && date < to;
}

function isRangeStart(date: Date, from: Date | undefined): boolean {
  if (!from) return false;
  return isSameDay(date, from);
}

function isRangeEnd(date: Date, to: Date | undefined): boolean {
  if (!to) return false;
  return isSameDay(date, to);
}

function buildMonthDays(year: number, month: number): Array<Date | null> {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells: Array<Date | null> = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }

  return cells;
}

// ── Chevron icons (shared across modes) ──

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.56501 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}

// ── Month grid (for mode="month") ──

function MonthGrid({
  year,
  selectedRange,
  onSelectMonth,
  locale,
  minDate,
  maxDate,
}: {
  year: number;
  selectedRange?: DateRange;
  onSelectMonth: (range: DateRange) => void;
  locale?: string;
  minDate?: Date;
  maxDate?: Date;
}) {
  const monthNames = useMemo(() => getMonthNames(locale ?? "en"), [locale]);

  return (
    <div className="grid grid-cols-2 gap-1">
      {monthNames.map((name, i) => {
        const mStart = new Date(year, i, 1);
        const mEnd = new Date(year, i + 1, 0);
        const disabled =
          (minDate != null && mEnd < minDate) ||
          (maxDate != null && mStart > maxDate);
        const isSelected =
          selectedRange?.from != null &&
          selectedRange.from.getFullYear() === year &&
          selectedRange.from.getMonth() === i;
        const isCurrentMonth =
          new Date().getFullYear() === year && new Date().getMonth() === i;

        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onSelectMonth({ from: mStart, to: mEnd })}
            className={cn(
              "flex h-8 items-center justify-center rounded-md text-sm",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none",
              "disabled:pointer-events-none disabled:opacity-50",
              isCurrentMonth && !isSelected && "bg-accent/50 font-semibold",
              isSelected &&
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            )}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}

// ── Main Calendar ──

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      className,
      selected,
      onSelect,
      minDate,
      maxDate,
      mode = "single",
      selectedRange,
      onSelectRange,
      numberOfMonths = 1,
      locale: localeProp,
      month: controlledMonth,
      onMonthChange,
      hideNavigation = false,
      hideHeader = false,
      ...rest
    },
    ref,
  ) => {
    const { locale: i18nLocale } = useTranslation("simplix/ui");
    const locale = localeProp ?? i18nLocale;

    const [uncontrolledMonth, setUncontrolledMonth] = useState(() => {
      if ((mode === "range" || mode === "week") && selectedRange?.from) return selectedRange.from;
      return selected ?? new Date();
    });

    const viewDate = controlledMonth ?? uncontrolledMonth;

    function setViewDate(updater: Date | ((prev: Date) => Date)) {
      const next = typeof updater === "function" ? updater(viewDate) : updater;
      onMonthChange?.(next);
      if (controlledMonth === undefined) {
        setUncontrolledMonth(next);
      }
    }

    const [rangeStart, setRangeStart] = useState<Date | undefined>(undefined);
    const [hoveredDate, setHoveredDate] = useState<Date | undefined>(undefined);

    const weekdayNames = useMemo(() => getWeekdayNames(locale), [locale]);

    const baseYear = viewDate.getFullYear();
    const baseMonth = viewDate.getMonth();

    const months = useMemo(() => {
      const result: Array<{ year: number; month: number; days: Array<Date | null> }> = [];
      for (let i = 0; i < numberOfMonths; i++) {
        const d = new Date(baseYear, baseMonth + i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        result.push({ year: y, month: m, days: buildMonthDays(y, m) });
      }
      return result;
    }, [baseYear, baseMonth, numberOfMonths]);

    function navigateMonth(delta: number) {
      setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    }

    function navigateYear(delta: number) {
      setViewDate((prev) => new Date(prev.getFullYear() + delta, prev.getMonth(), 1));
    }

    function handleDayClick(date: Date) {
      if (mode === "single") {
        onSelect?.(date);
        return;
      }

      if (mode === "week") {
        const from = startOfWeekFn(date);
        const to = endOfWeekFn(date);
        onSelectRange?.({ from, to });
        return;
      }

      // Range mode
      if (!rangeStart) {
        setRangeStart(date);
        onSelectRange?.({ from: date, to: undefined });
      } else {
        if (date < rangeStart) {
          setRangeStart(date);
          onSelectRange?.({ from: date, to: undefined });
        } else {
          onSelectRange?.({ from: rangeStart, to: date });
          setRangeStart(undefined);
        }
      }
    }

    function handleMonthSelect(range: DateRange) {
      onSelectRange?.(range);
    }

    // Determine range highlighting based on mode
    const rangeFrom = (() => {
      if (mode === "range") return selectedRange?.from ?? rangeStart;
      if (mode === "week") return selectedRange?.from;
      return undefined;
    })();
    const rangeTo = (() => {
      if (mode === "range") return selectedRange?.to;
      if (mode === "week") return selectedRange?.to;
      return undefined;
    })();

    // Week mode hover range
    const hoverWeekFrom = mode === "week" && hoveredDate ? startOfWeekFn(hoveredDate) : undefined;
    const hoverWeekTo = mode === "week" && hoveredDate ? endOfWeekFn(hoveredDate) : undefined;

    // Month mode: year-only navigation
    const isMonthMode = mode === "month";
    const prevLabel = isMonthMode ? "Previous year" : "Previous month";
    const nextLabel = isMonthMode ? "Next year" : "Next month";
    const handlePrev = isMonthMode ? () => navigateYear(-1) : () => navigateMonth(-1);
    const handleNext = isMonthMode ? () => navigateYear(1) : () => navigateMonth(1);

    // Header label
    const headerLabel = isMonthMode
      ? new Intl.DateTimeFormat(locale, { year: "numeric" }).format(new Date(baseYear, 0, 1))
      : months.map(({ year, month }) =>
          new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(year, month, 1)),
        );

    return (
      <div ref={ref} className={cn("w-fit p-3", className)} {...rest}>
        {/* Header */}
        {!hideHeader && (
          <nav className="flex items-center justify-between pb-2">
            {!hideNavigation ? (
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={handlePrev}
                aria-label={prevLabel}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            ) : <span />}
            <div className="flex gap-4">
              {isMonthMode ? (
                <span className="text-sm font-medium">{headerLabel}</span>
              ) : (
                (headerLabel as string[]).map((label, i) => (
                  <span key={i} className="text-sm font-medium">{label}</span>
                ))
              )}
            </div>
            {!hideNavigation ? (
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={handleNext}
                aria-label={nextLabel}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : <span />}
          </nav>
        )}

        {/* Month mode: sizing row + month grid */}
        {isMonthMode && (
          <div>
            {/* Invisible sizing row — 7 cells matching day grid w-8 to maintain consistent width */}
            <div className="grid grid-cols-7 gap-0">
              {Array.from({ length: 7 }, (_, i) => (
                <span key={i} className="h-0 w-8" aria-hidden="true" />
              ))}
            </div>
            <MonthGrid
              year={baseYear}
              selectedRange={selectedRange}
              onSelectMonth={handleMonthSelect}
              locale={locale}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>
        )}

        {/* Day grid modes: single, range, week */}
        {!isMonthMode && (
          <div className="flex gap-3">
            {months.map(({ year, month, days }) => (
              <div key={`${year}-${month}`} className={cn("flex-1 min-w-0", numberOfMonths > 1 && "rounded-md border border-input p-2")}>
                {/* Day-of-week headers */}
                <header className="grid grid-cols-7 gap-0">
                  {weekdayNames.map((day, i) => (
                    <span
                      key={i}
                      className="flex h-8 w-8 items-center justify-center text-xs font-medium text-muted-foreground"
                    >
                      {day}
                    </span>
                  ))}
                </header>

                {/* Day grid */}
                <div className="grid grid-cols-7 gap-0">
                  {days.map((date, i) => {
                    if (!date) {
                      return <span key={`empty-${i}`} className="h-8" />;
                    }

                    const isSelected = mode === "single" && selected ? isSameDay(date, selected) : false;
                    const isToday = isSameDay(date, new Date());
                    const disabled = isDateDisabled(date, minDate, maxDate);

                    // Range/week highlighting
                    const useRange = mode === "range" || mode === "week";
                    const inRange = useRange && isInRange(date, rangeFrom, rangeTo);
                    const isStart = useRange && isRangeStart(date, rangeFrom);
                    const isEnd = useRange && isRangeEnd(date, rangeTo);

                    // Week mode hover highlighting
                    const inHoverWeek =
                      mode === "week" &&
                      !selectedRange?.from &&
                      hoverWeekFrom != null &&
                      hoverWeekTo != null &&
                      date >= hoverWeekFrom &&
                      date <= hoverWeekTo;

                    // Week mode: highlight entire selected week
                    const inSelectedWeek =
                      mode === "week" &&
                      selectedRange?.from != null &&
                      isSameWeek(date, selectedRange.from);

                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleDayClick(date)}
                        onMouseEnter={mode === "week" ? () => setHoveredDate(date) : undefined}
                        onMouseLeave={mode === "week" ? () => setHoveredDate(undefined) : undefined}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-md text-sm",
                          "hover:bg-accent hover:text-accent-foreground",
                          "focus-visible:outline-none",
                          "disabled:pointer-events-none disabled:opacity-50",
                          isToday && "bg-accent/50 font-semibold",
                          // Single mode selection
                          isSelected &&
                            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                          // Range mode highlighting
                          inRange && "bg-accent rounded-none",
                          isStart &&
                            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-l-md rounded-r-none",
                          isEnd &&
                            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-r-md rounded-l-none",
                          // Week mode: selected week background
                          mode === "week" && inSelectedWeek && !isStart && !isEnd && "bg-accent rounded-none",
                          // Week mode: hover week background
                          inHoverWeek && "bg-accent/50 rounded-none",
                        )}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

Calendar.displayName = "Calendar";
