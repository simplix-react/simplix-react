import { memo, useCallback, useMemo } from "react";
import { useDrop } from "react-dnd";

import { cn } from "../../lib/cn";
import { useCalendarData } from "../../context/calendar-context";
import { useHourPx } from "../week-and-day-view/time-grid-context";
import { ItemTypes } from "./item-types";
import type { CalendarDragItem } from "./item-types";

interface DroppableTimeBlockProps {
  date: Date;
  hour: number;
  minute: number;
  children: React.ReactNode;
}

const DndDroppableTimeBlock = memo(({ date, hour, minute, children }: DroppableTimeBlockProps) => {
  const { onItemMove } = useCalendarData();

  const handleDrop = useCallback(
    (dragged: CalendarDragItem) => {
      const { item, durationMs } = dragged;

      const newStart = new Date(date);
      newStart.setHours(hour, minute, 0, 0);
      const newEnd = new Date(newStart.getTime() + durationMs);

      onItemMove?.(item, newStart, newEnd);
      return { moved: true };
    },
    [date, hour, minute, onItemMove]
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.ITEM,
      drop: handleDrop,
      collect: (monitor) => ({ isOver: monitor.isOver() }),
    }),
    [handleDrop]
  );

  const hourPx = useHourPx();
  const className = useMemo(() => cn("relative", isOver && "bg-accent/50"), [isOver]);

  return (
    <div ref={drop as unknown as React.Ref<HTMLDivElement>} className={className} style={{ height: `${hourPx / 4}px` }}>
      {children}
    </div>
  );
});

DndDroppableTimeBlock.displayName = "DndDroppableTimeBlock";

/** Week/day-grid time slot drop target; a plain wrapper when dnd is disabled. */
export function DroppableTimeBlock({ date, hour, minute, children }: DroppableTimeBlockProps) {
  const { dndEnabled } = useCalendarData();
  const hourPx = useHourPx();
  if (!dndEnabled) return <div className="relative" style={{ height: `${hourPx / 4}px` }}>{children}</div>;
  return (
    <DndDroppableTimeBlock date={date} hour={hour} minute={minute}>
      {children}
    </DndDroppableTimeBlock>
  );
}
