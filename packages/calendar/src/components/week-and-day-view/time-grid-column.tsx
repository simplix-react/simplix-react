import { areIntervalsOverlapping } from "date-fns";

import { cn } from "../../lib/cn";
import { getItemBlockStyle, isWorkingHour } from "../../helpers";
import { useCalendarData } from "../../context/calendar-context";
import type { CalendarItem, WorkingHours } from "../../model/types";
import { DroppableTimeBlock } from "../dnd/droppable-time-block";
import { ItemBlock } from "./item-block";
import { useHourPx } from "./time-grid-context";

const QUARTERS = [0, 15, 30, 45];

interface TimeGridColumnProps {
  day: Date;
  hours: number[];
  workingHours: WorkingHours;
  groupedItems: CalendarItem[][];
  visibleRange: { from: number; to: number };
  /** Background tint class applied across the column when the day is highlighted. */
  highlightBgClass?: string;
}

function slotDate(day: Date, hour: number, minute: number): Date {
  const date = new Date(day);
  date.setHours(hour, minute, 0, 0);
  return date;
}

/** One day's worth of hour rows plus its absolutely-positioned timed items. */
export function TimeGridColumn({ day, hours, workingHours, groupedItems, visibleRange, highlightBgClass }: TimeGridColumnProps) {
  const { onCellClick } = useCalendarData();
  const hourPx = useHourPx();

  return (
    <div className="relative">
      {highlightBgClass && <div className={cn("pointer-events-none absolute inset-0 z-0 opacity-60", highlightBgClass)} />}
      {hours.map((hour, index) => {
        const isDisabled = !isWorkingHour(day, hour, workingHours);

        return (
          <div key={hour} className={cn("relative", isDisabled && "bg-muted/30")} style={{ height: `${hourPx}px` }}>
            {index !== 0 && <div className="pointer-events-none absolute inset-x-0 top-0 border-b" />}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed" />

            {QUARTERS.map((minute) => (
              <DroppableTimeBlock key={minute} date={day} hour={hour} minute={minute}>
                <button
                  type="button"
                  className="size-full cursor-pointer transition-colors hover:bg-accent"
                  onClick={() => onCellClick?.(slotDate(day, hour, minute))}
                />
              </DroppableTimeBlock>
            ))}
          </div>
        );
      })}

      {groupedItems.map((group, groupIndex) =>
        group.map((item) => {
          let style = getItemBlockStyle(item, day, groupIndex, groupedItems.length, visibleRange);
          const hasOverlap = groupedItems.some(
            (otherGroup, otherIndex) =>
              otherIndex !== groupIndex &&
              otherGroup.some((other) =>
                areIntervalsOverlapping({ start: item.start, end: item.end }, { start: other.start, end: other.end })
              )
          );

          if (!hasOverlap) style = { ...style, width: "100%", left: "0%" };

          return (
            <div key={item.id} className="absolute p-1" style={style}>
              <ItemBlock item={item} />
            </div>
          );
        })
      )}
    </div>
  );
}
