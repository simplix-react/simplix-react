import { memo, useCallback, useMemo } from "react";
import { useDrop } from "react-dnd";

import { cn } from "../../lib/cn";
import { useCalendarData } from "../../context/calendar-context";
import type { CalendarCell } from "../../model/types";
import { ItemTypes } from "./item-types";
import type { CalendarDragItem } from "./item-types";

interface DroppableDayCellProps {
  cell: CalendarCell;
  children: React.ReactNode;
}

const DndDroppableDayCell = memo(({ cell, children }: DroppableDayCellProps) => {
  const { onItemMove } = useCalendarData();

  const handleDrop = useCallback(
    (dragged: CalendarDragItem) => {
      const { item, durationMs } = dragged;

      // Preserve the item's time-of-day; only move it to the dropped calendar day.
      const newStart = new Date(cell.date);
      newStart.setHours(item.start.getHours(), item.start.getMinutes(), item.start.getSeconds(), item.start.getMilliseconds());
      const newEnd = new Date(newStart.getTime() + durationMs);

      onItemMove?.(item, newStart, newEnd);
      return { moved: true };
    },
    [cell.date, onItemMove]
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.ITEM,
      drop: handleDrop,
      collect: (monitor) => ({ isOver: monitor.isOver() }),
    }),
    [handleDrop]
  );

  const className = useMemo(() => cn(isOver && "bg-accent/50"), [isOver]);

  return (
    <div ref={drop as unknown as React.Ref<HTMLDivElement>} className={className}>
      {children}
    </div>
  );
});

DndDroppableDayCell.displayName = "DndDroppableDayCell";

/** Month-grid day drop target; a plain wrapper when dnd is disabled. */
export function DroppableDayCell({ cell, children }: DroppableDayCellProps) {
  const { dndEnabled } = useCalendarData();
  if (!dndEnabled) return <div>{children}</div>;
  return <DndDroppableDayCell cell={cell}>{children}</DndDroppableDayCell>;
}
