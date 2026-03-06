import { type ComponentPropsWithRef, forwardRef, useMemo, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { cn } from "../../utils/cn";

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
  mode?: "single" | "range";
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

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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
      if (mode === "range" && selectedRange?.from) return selectedRange.from;
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

    function handleDayClick(date: Date) {
      if (mode === "single") {
        onSelect?.(date);
        return;
      }

      // Range mode
      if (!rangeStart) {
        setRangeStart(date);
        onSelectRange?.({ from: date, to: undefined });
      } else {
        if (date < rangeStart) {
          // Clicked before the start — reset with new start
          setRangeStart(date);
          onSelectRange?.({ from: date, to: undefined });
        } else {
          // Complete the range
          onSelectRange?.({ from: rangeStart, to: date });
          setRangeStart(undefined);
        }
      }
    }

    const rangeFrom = mode === "range" ? (selectedRange?.from ?? rangeStart) : undefined;
    const rangeTo = mode === "range" ? selectedRange?.to : undefined;

    return (
      <div ref={ref} className={cn("w-fit p-3", className)} {...rest}>
        {/* Header */}
        {!hideHeader && (
          <nav className="flex items-center justify-between pb-2">
            {!hideNavigation ? (
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => navigateMonth(-1)}
                aria-label="Previous month"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                </svg>
              </button>
            ) : <span />}
            <div className="flex gap-4">
              {months.map(({ year, month }) => {
                const label = new Intl.DateTimeFormat(locale, {
                  month: "long",
                  year: "numeric",
                }).format(new Date(year, month, 1));
                return (
                  <span key={`${year}-${month}`} className="text-sm font-medium">
                    {label}
                  </span>
                );
              })}
            </div>
            {!hideNavigation ? (
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => navigateMonth(1)}
                aria-label="Next month"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.56501 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                </svg>
              </button>
            ) : <span />}
          </nav>
        )}

        {/* Month grids */}
        <div className="flex gap-4">
          {months.map(({ year, month, days }) => (
            <div key={`${year}-${month}`} className="flex-1 min-w-0">
              {/* Day-of-week headers */}
              <header className="grid grid-cols-7 gap-0">
                {weekdayNames.map((day, i) => (
                  <span
                    key={i}
                    className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
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

                  const inRange = mode === "range" && isInRange(date, rangeFrom, rangeTo);
                  const isStart = mode === "range" && isRangeStart(date, rangeFrom);
                  const isEnd = mode === "range" && isRangeEnd(date, rangeTo);

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleDayClick(date)}
                      className={cn(
                        "flex h-8 items-center justify-center rounded-md text-sm",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:outline-none",
                        "disabled:pointer-events-none disabled:opacity-50",
                        isToday && "border border-accent",
                        isSelected &&
                          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                        inRange && "bg-accent rounded-none",
                        isStart &&
                          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-l-md rounded-r-none",
                        isEnd &&
                          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-r-md rounded-l-none",
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
      </div>
    );
  },
);

Calendar.displayName = "Calendar";
