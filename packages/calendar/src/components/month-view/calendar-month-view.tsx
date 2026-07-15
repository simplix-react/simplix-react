import { useMemo } from "react";
import { format, startOfWeek, addDays } from "date-fns";

import { useCalendarDate } from "../../context/calendar-context";
import { useCalendarTranslation } from "../../lib/use-calendar-translation";
import { getCalendarCells, calculateMonthItemPositions } from "../../helpers";
import type { CalendarItem } from "../../model/types";
import { DayCell } from "./day-cell";

interface CalendarMonthViewProps {
  singleDayItems: CalendarItem[];
  multiDayItems: CalendarItem[];
}

export function CalendarMonthView({ singleDayItems, multiDayItems }: CalendarMonthViewProps) {
  const { selectedDate } = useCalendarDate();
  const { locale } = useCalendarTranslation();

  const allItems = useMemo(() => [...multiDayItems, ...singleDayItems], [multiDayItems, singleDayItems]);

  const cells = useMemo(() => getCalendarCells(selectedDate, locale), [selectedDate, locale]);

  const itemPositions = useMemo(
    () => calculateMonthItemPositions(multiDayItems, singleDayItems, selectedDate),
    [multiDayItems, singleDayItems, selectedDate]
  );

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { locale });
    return Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), "EEE", { locale }));
  }, [locale]);

  // The weekday row stays fixed; the cell grid stretches to fill the available
  // height, with each week row shrinking down to a minimum before the grid
  // overflows and the inner scrollbar takes over. In an unconstrained parent
  // the view keeps its natural (minimum-row) height and no scrollbar appears.
  const weekRowCount = Math.ceil(cells.length / 7);

  return (
    <div className="flex h-full flex-col">
      <div className="grid shrink-0 grid-cols-7 divide-x border-b">
        {weekDays.map((day, index) => (
          <div key={index} className="flex items-center justify-center py-2">
            <span className="text-xs font-medium text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div
          className="grid grid-cols-7 overflow-hidden"
          style={{ minHeight: "100%", gridTemplateRows: `repeat(${weekRowCount}, minmax(4.5rem, 1fr))` }}
        >
          {cells.map((cell) => (
            <DayCell key={cell.date.toISOString()} cell={cell} items={allItems} itemPositions={itemPositions} />
          ))}
        </div>
      </div>
    </div>
  );
}
