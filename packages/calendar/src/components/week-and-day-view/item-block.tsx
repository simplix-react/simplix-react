import { differenceInMinutes } from "date-fns";
import { useRef, useState } from "react";
import type { HTMLAttributes } from "react";

import { cn } from "../../lib/cn";
import { patternClass } from "../../helpers";
import { itemColorClass } from "../../lib/item-colors";
import { formatTimeRange } from "../../lib/date-formats";
import { useCalendarData, useCalendarPreferences } from "../../context/calendar-context";
import { useCalendarTranslation } from "../../lib/use-calendar-translation";
import type { CalendarItem } from "../../model/types";
import { DraggableItem } from "../dnd/draggable-item";
import { useHourPx } from "./time-grid-context";

const BLOCK_BASE =
  "flex select-none flex-col gap-0.5 truncate whitespace-nowrap rounded-md border px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

/** Resize drags snap to this many minutes. */
const SNAP_MINUTES = 15;
/** A resized item can never shrink below this duration. */
const MIN_DURATION_MINUTES = 15;

interface ItemBlockProps extends HTMLAttributes<HTMLDivElement> {
  item: CalendarItem;
}

interface ResizeState {
  edge: "start" | "end";
  startY: number;
  /** Snapped minute delta applied to the dragged edge. */
  deltaMinutes: number;
}

function withMinutes(base: Date, deltaMinutes: number): Date {
  return new Date(base.getTime() + deltaMinutes * 60_000);
}

/** A timed item card rendered inside the week/day time grid. */
export function ItemBlock({ item, className }: ItemBlockProps) {
  const { badgeVariant } = useCalendarPreferences();
  const { onItemClick, onItemResize, renderItemOverlay } = useCalendarData();
  const { language, locale } = useCalendarTranslation();
  const hourPx = useHourPx();

  const [resize, setResize] = useState<ResizeState | null>(null);
  const suppressClickRef = useRef(false);

  const durationInMinutes = differenceInMinutes(item.end, item.start);

  const resizable = !!item.resizable && !!onItemResize;

  const snapMinutes = (pixels: number) => Math.round(((pixels / hourPx) * 60) / SNAP_MINUTES) * SNAP_MINUTES;

  // During a drag the card previews the adjusted bounds; committed on pointer up.
  const previewStart = resize?.edge === "start" ? withMinutes(item.start, resize.deltaMinutes) : item.start;
  const previewEnd = resize?.edge === "end" ? withMinutes(item.end, resize.deltaMinutes) : item.end;
  const previewDuration = differenceInMinutes(previewEnd, previewStart);
  const previewHeight = (previewDuration / 60) * hourPx - 8;
  const previewOffset = resize?.edge === "start" ? (resize.deltaMinutes / 60) * hourPx : 0;

  const compact = previewHeight < 34;

  const cardClasses = cn(
    BLOCK_BASE,
    itemColorClass(item.color, badgeVariant),
    patternClass(item.pattern),
    compact && "justify-center py-0",
    resize && "ring-1 ring-ring",
    className
  );

  const activate = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onItemClick?.(item);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate();
    }
  };

  const beginResize = (edge: "start" | "end") => (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resizable) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setResize({ edge, startY: e.clientY, deltaMinutes: 0 });
  };

  const moveResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resize) return;
    e.preventDefault();
    e.stopPropagation();
    const rawDelta = snapMinutes(e.clientY - resize.startY);
    // Clamp so the item keeps a minimum duration.
    const deltaMinutes =
      resize.edge === "start"
        ? Math.min(rawDelta, durationInMinutes - MIN_DURATION_MINUTES)
        : Math.max(rawDelta, MIN_DURATION_MINUTES - durationInMinutes);
    if (deltaMinutes !== resize.deltaMinutes) setResize({ ...resize, deltaMinutes });
  };

  const endResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resize) return;
    e.preventDefault();
    e.stopPropagation();
    const { deltaMinutes, edge } = resize;
    setResize(null);
    if (deltaMinutes !== 0) {
      suppressClickRef.current = true;
      const nextStart = edge === "start" ? withMinutes(item.start, deltaMinutes) : item.start;
      const nextEnd = edge === "end" ? withMinutes(item.end, deltaMinutes) : item.end;
      onItemResize?.(item, nextStart, nextEnd);
    }
  };

  const resizeHandleProps = (edge: "start" | "end") => ({
    onPointerDown: beginResize(edge),
    onPointerMove: moveResize,
    onPointerUp: endResize,
    onPointerCancel: endResize,
  });

  const overlay = renderItemOverlay?.(item);

  return (
    <DraggableItem item={item}>
      <div
        role="button"
        tabIndex={0}
        className={cn(cardClasses, "relative")}
        style={{ height: `${previewHeight}px`, marginTop: previewOffset ? `${previewOffset}px` : undefined }}
        onClick={activate}
        onKeyDown={handleKeyDown}
      >
        {resizable && (
          <div
            className="absolute inset-x-0 top-0 z-10 h-1.5 cursor-ns-resize touch-none"
            {...resizeHandleProps("start")}
          />
        )}

        <div className="flex items-center gap-1.5 truncate">
          {(badgeVariant === "mixed" || badgeVariant === "dot") && (
            <svg width="8" height="8" viewBox="0 0 8 8" className="event-dot shrink-0">
              <circle cx="4" cy="4" r="4" />
            </svg>
          )}
          <p className="truncate font-semibold">{item.title}</p>
        </div>

        {!compact && previewDuration > 25 && <p>{formatTimeRange(previewStart, previewEnd, language, locale)}</p>}

        {overlay && (
          <div
            className="absolute bottom-0.5 right-0.5 z-20"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {overlay}
          </div>
        )}

        {resizable && (
          <div
            className="absolute inset-x-0 bottom-0 z-10 h-1.5 cursor-ns-resize touch-none"
            {...resizeHandleProps("end")}
          />
        )}
      </div>
    </DraggableItem>
  );
}
