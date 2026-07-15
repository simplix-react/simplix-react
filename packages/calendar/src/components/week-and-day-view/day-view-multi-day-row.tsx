import { isWithinInterval, differenceInDays, startOfDay, endOfDay } from "date-fns";

import type { CalendarItem } from "../../model/types";
import { MonthItemBadge } from "../month-view/month-item-badge";

interface DayViewMultiDayRowProps {
  selectedDate: Date;
  multiDayItems: CalendarItem[];
}

/** Row above the day grid holding multi-day items that overlap the selected day. */
export function DayViewMultiDayRow({ selectedDate, multiDayItems }: DayViewMultiDayRowProps) {
  const dayStart = startOfDay(selectedDate);
  const dayEnd = endOfDay(selectedDate);

  const itemsInDay = multiDayItems
    .filter((item) => {
      return (
        isWithinInterval(dayStart, { start: item.start, end: item.end }) ||
        isWithinInterval(dayEnd, { start: item.start, end: item.end }) ||
        (item.start <= dayStart && item.end >= dayEnd)
      );
    })
    .sort((a, b) => differenceInDays(b.end, b.start) - differenceInDays(a.end, a.start));

  if (itemsInDay.length === 0) return null;

  return (
    <div className="flex border-b">
      <div className="w-[72px]" />
      <div className="flex flex-1 flex-col gap-1 border-l py-1">
        {itemsInDay.map((item) => {
          const itemStart = startOfDay(item.start);
          const itemEnd = startOfDay(item.end);
          const currentDate = startOfDay(selectedDate);

          const itemTotalDays = differenceInDays(itemEnd, itemStart) + 1;
          const itemCurrentDay = differenceInDays(currentDate, itemStart) + 1;

          return <MonthItemBadge key={item.id} item={item} cellDate={selectedDate} itemCurrentDay={itemCurrentDay} itemTotalDays={itemTotalDays} />;
        })}
      </div>
    </div>
  );
}
