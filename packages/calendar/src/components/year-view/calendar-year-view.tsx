import { useMemo } from "react";
import { addMonths, startOfYear } from "date-fns";

import { useCalendarDate } from "../../context/calendar-context";
import type { CalendarItem } from "../../model/types";
import { YearViewMonth } from "./year-view-month";

interface CalendarYearViewProps {
  allItems: CalendarItem[];
}

export function CalendarYearView({ allItems }: CalendarYearViewProps) {
  const { selectedDate } = useCalendarDate();

  const months = useMemo(() => {
    const yearStart = startOfYear(selectedDate);
    return Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));
  }, [selectedDate]);

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {months.map((month) => (
          <YearViewMonth key={month.toString()} month={month} items={allItems} />
        ))}
      </div>
    </div>
  );
}
