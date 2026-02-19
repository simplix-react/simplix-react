import { type ComponentPropsWithRef, forwardRef, useMemo, useState } from "react";

import { cn } from "../utils/cn";

export interface CalendarProps
  extends Omit<ComponentPropsWithRef<"div">, "onSelect"> {
  selected?: Date;
  onSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

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

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, selected, onSelect, minDate, maxDate, ...rest }, ref) => {
    const [viewDate, setViewDate] = useState(
      () => selected ?? new Date(),
    );

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const days = useMemo(() => {
      const daysInMonth = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);
      const cells: Array<Date | null> = [];

      // Leading empty cells
      for (let i = 0; i < firstDay; i++) {
        cells.push(null);
      }

      // Day cells
      for (let d = 1; d <= daysInMonth; d++) {
        cells.push(new Date(year, month, d));
      }

      return cells;
    }, [year, month]);

    const monthLabel = new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(viewDate);

    function navigateMonth(delta: number) {
      setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    }

    return (
      <div ref={ref} className={cn("w-fit p-3", className)} {...rest}>
        {/* Header */}
        <nav className="flex items-center justify-between pb-2">
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-sm hover:bg-accent hover:text-accent-foreground"
            onClick={() => navigateMonth(-1)}
            aria-label="Previous month"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
            >
              <path
                d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <span className="text-sm font-medium">{monthLabel}</span>
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-sm hover:bg-accent hover:text-accent-foreground"
            onClick={() => navigateMonth(1)}
            aria-label="Next month"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
            >
              <path
                d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.56501 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </nav>

        {/* Day-of-week headers */}
        <header className="grid grid-cols-7 gap-0">
          {DAYS_OF_WEEK.map((day) => (
            <span
              key={day}
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
              return <span key={`empty-${i}`} className="h-8 w-8" />;
            }

            const isSelected = selected ? isSameDay(date, selected) : false;
            const isToday = isSameDay(date, new Date());
            const disabled = isDateDisabled(date, minDate, maxDate);

            return (
              <button
                key={date.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => onSelect?.(date)}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:pointer-events-none disabled:opacity-50",
                  isToday && "border border-accent",
                  isSelected &&
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);

Calendar.displayName = "Calendar";
