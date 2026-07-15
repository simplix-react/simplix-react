import { useMemo } from "react";
import { startOfDay, startOfWeek, endOfWeek, addDays, differenceInDays, isBefore, isAfter } from "date-fns";

import type { CalendarItem } from "../../model/types";
import { MonthItemBadge } from "../month-view/month-item-badge";

interface WeekViewMultiDayRowProps {
  selectedDate: Date;
  multiDayItems: CalendarItem[];
}

/** Row above the week grid that lays multi-day items across their day span. */
export function WeekViewMultiDayRow({ selectedDate, multiDayItems }: WeekViewMultiDayRowProps) {
  const weekStart = startOfWeek(selectedDate);
  const weekEnd = endOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const processedItems = useMemo(() => {
    return multiDayItems
      .map((item) => {
        const adjustedStart = isBefore(item.start, weekStart) ? weekStart : item.start;
        const adjustedEnd = isAfter(item.end, weekEnd) ? weekEnd : item.end;
        return {
          item,
          adjustedStart,
          startIndex: differenceInDays(adjustedStart, weekStart),
          endIndex: differenceInDays(adjustedEnd, weekStart),
        };
      })
      .sort((a, b) => {
        const startDiff = a.adjustedStart.getTime() - b.adjustedStart.getTime();
        if (startDiff !== 0) return startDiff;
        return b.endIndex - b.startIndex - (a.endIndex - a.startIndex);
      });
  }, [multiDayItems, weekStart, weekEnd]);

  const itemRows = useMemo(() => {
    const rows: (typeof processedItems)[] = [];
    processedItems.forEach((entry) => {
      let rowIndex = rows.findIndex((row) => row.every((e) => e.endIndex < entry.startIndex || e.startIndex > entry.endIndex));
      if (rowIndex === -1) {
        rowIndex = rows.length;
        rows.push([]);
      }
      rows[rowIndex].push(entry);
    });
    return rows;
  }, [processedItems]);

  const hasItemsInWeek = useMemo(() => {
    return multiDayItems.some(
      (item) =>
        (item.start >= weekStart && item.start <= weekEnd) ||
        (item.end >= weekStart && item.end <= weekEnd) ||
        (item.start <= weekStart && item.end >= weekEnd)
    );
  }, [multiDayItems, weekStart, weekEnd]);

  if (!hasItemsInWeek) return null;

  return (
    <div className="hidden overflow-hidden sm:flex">
      <div className="w-[72px] border-b" />
      <div className="grid flex-1 grid-cols-7 divide-x border-b border-l">
        {weekDays.map((day, dayIndex) => (
          <div key={day.toISOString()} className="flex h-full flex-col gap-1 py-1">
            {itemRows.map((row, rowIndex) => {
              const entry = row.find((e) => e.startIndex <= dayIndex && e.endIndex >= dayIndex);

              if (!entry) return <div key={`${rowIndex}-${dayIndex}`} className="h-[26px]" />;

              let position: "first" | "middle" | "last" | "none" = "none";
              if (dayIndex === entry.startIndex && dayIndex === entry.endIndex) position = "none";
              else if (dayIndex === entry.startIndex) position = "first";
              else if (dayIndex === entry.endIndex) position = "last";
              else position = "middle";

              return <MonthItemBadge key={`${entry.item.id}-${dayIndex}`} item={entry.item} cellDate={startOfDay(day)} position={position} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
