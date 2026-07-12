import { memo, useCallback, useEffect, useRef } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { differenceInMilliseconds } from "date-fns";

import { cn } from "../../lib/cn";
import { useCalendarData } from "../../context/calendar-context";
import type { CalendarItem } from "../../model/types";
import { ItemTypes } from "./item-types";
import type { CalendarDragItem } from "./item-types";

interface DraggableItemProps {
  item: CalendarItem;
  children: React.ReactNode;
}

const DndDraggableItem = memo(({ item, children }: DraggableItemProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const getItem = useCallback((): CalendarDragItem => {
    const width = ref.current?.offsetWidth ?? 0;
    const height = ref.current?.offsetHeight ?? 0;
    const durationMs = differenceInMilliseconds(item.end, item.start);
    return { item, children, width, height, durationMs };
  }, [item, children]);

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.ITEM,
      item: getItem,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [getItem]
  );

  // Hide the browser's default drag ghost; a custom layer renders the preview.
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  drag(ref);

  return (
    <div ref={ref} className={cn(isDragging && "opacity-40")} draggable>
      {children}
    </div>
  );
});

DndDraggableItem.displayName = "DndDraggableItem";

/** Wraps an item so it can be dragged when dnd is enabled; otherwise a no-op passthrough. */
export function DraggableItem({ item, children }: DraggableItemProps) {
  const { dndEnabled } = useCalendarData();
  if (!dndEnabled) return <>{children}</>;
  return <DndDraggableItem item={item}>{children}</DndDraggableItem>;
}
