import { useMemo } from "react";
import { format, getDaysInMonth, startOfMonth, startOfWeek, addDays, endOfDay, startOfDay } from "date-fns";

import { useCalendarDate, useCalendarView } from "../../context/calendar-context";
import { useCalendarTranslation } from "../../lib/use-calendar-translation";
import type { CalendarItem } from "../../model/types";
import { YearViewDayCell } from "./year-view-day-cell";

interface YearViewMonthProps {
  month: Date;
  items: CalendarItem[];
}

export function YearViewMonth({ month, items }: YearViewMonthProps) {
  const { setSelectedDate } = useCalendarDate();
  const { setCurrentView } = useCalendarView();
  const { locale } = useCalendarTranslation();

  const monthName = format(month, "MMMM", { locale });

  const daysInMonth = useMemo(() => {
    const totalDays = getDaysInMonth(month);
    const monthStart = startOfMonth(month);
    const weekStart = startOfWeek(monthStart, { locale });
    const firstDayOffset = (monthStart.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24);

    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    const blanks = Array(firstDayOffset).fill(null);

    return [...blanks, ...days];
  }, [month, locale]);

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { locale });
    return Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), "EEE", { locale }));
  }, [locale]);

  const handleClick = () => {
    setSelectedDate(new Date(month.getFullYear(), month.getMonth(), 1));
    setCurrentView("month");
  };

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={handleClick}
        className="w-full rounded-t-lg border px-3 py-2 text-sm font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {monthName}
      </button>

      <div className="flex-1 space-y-2 rounded-b-lg border border-t-0 p-3">
        <div className="grid grid-cols-7 gap-x-0.5 text-center">
          {weekDays.map((day, index) => (
            <div key={index} className="text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-x-0.5 gap-y-2">
          {daysInMonth.map((day, index) => {
            if (day === null) return <div key={`blank-${index}`} className="h-10" />;

            const date = new Date(month.getFullYear(), month.getMonth(), day);
            // An item covers the day when its span intersects it (multi-day items included).
            const dayItems = items.filter((item) => item.start <= endOfDay(date) && startOfDay(date) <= item.end);

            return <YearViewDayCell key={`day-${day}`} day={day} date={date} items={dayItems} />;
          })}
        </div>
      </div>
    </div>
  );
}
