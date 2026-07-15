import { isToday } from "date-fns";

import { cn } from "../../lib/cn";
import { useCalendarData, useCalendarDate, useCalendarView } from "../../context/calendar-context";
import type { CalendarColor, CalendarItem } from "../../model/types";

interface YearViewDayCellProps {
  day: number;
  date: Date;
  items: CalendarItem[];
}

const DOT_COLORS: Record<CalendarColor, string> = {
  blue: "bg-blue-600",
  green: "bg-green-600",
  red: "bg-red-600",
  yellow: "bg-yellow-600",
  purple: "bg-purple-600",
  orange: "bg-orange-600",
  gray: "bg-neutral-600",
  teal: "bg-teal-600",
};

const MAX_INDICATORS = 3;

export function YearViewDayCell({ day, date, items }: YearViewDayCellProps) {
  const { setSelectedDate } = useCalendarDate();
  const { setCurrentView } = useCalendarView();
  const { onCellClick } = useCalendarData();

  const itemCount = items.length;

  // A consumer-supplied onCellClick replaces the default day-view drilldown.
  const handleClick = () => {
    if (onCellClick) {
      onCellClick(date);
      return;
    }
    setSelectedDate(date);
    setCurrentView("day");
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className="flex h-11 flex-1 flex-col items-center justify-start gap-0.5 rounded-md pt-1 hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <div
        className={cn(
          "flex size-6 items-center justify-center rounded-full text-xs font-medium",
          isToday(date) && "bg-primary font-semibold text-primary-foreground"
        )}
      >
        {day}
      </div>

      {itemCount > 0 && (
        <div className="mt-0.5 flex gap-0.5">
          {itemCount <= MAX_INDICATORS ? (
            items.map((item) => <div key={item.id} className={cn("size-1.5 rounded-full", DOT_COLORS[item.color])} />)
          ) : (
            <>
              <div className={cn("size-1.5 rounded-full", DOT_COLORS[items[0].color])} />
              <span className="text-[7px] text-muted-foreground">+{itemCount - 1}</span>
            </>
          )}
        </div>
      )}
    </button>
  );
}
