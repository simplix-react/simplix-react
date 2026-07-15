import { isToday } from "date-fns";

import { cn } from "../../lib/cn";
import { dayHighlightBgClass, dayHighlightTextClass } from "../../lib/item-colors";
import { useCalendarData } from "../../context/calendar-context";
import type { CalendarCell, DayHighlight } from "../../model/types";

const HOURS = Array.from({ length: 24 }, (_, h) => h);

interface HeatmapDayCellProps {
  cell: CalendarCell;
  counts: number[] | undefined;
  max: number;
  highlight?: DayHighlight;
}

/** One month-grid day rendering a 24-slot occupancy heat strip. */
export function HeatmapDayCell({ cell, counts, max, highlight }: HeatmapDayCellProps) {
  const { onCellClick, renderDayBadge } = useCalendarData();
  const { day, currentMonth, date } = cell;
  const isSunday = date.getDay() === 0;

  return (
    <button
      type="button"
      onClick={() => onCellClick?.(date)}
      className={cn(
        "flex h-full min-h-[92px] flex-col gap-1.5 border-l border-t p-1.5 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring",
        isSunday && "border-l-0",
        !currentMonth && "opacity-40",
        highlight && dayHighlightBgClass(highlight.color)
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span
          className={cn(
            "text-xs font-semibold",
            isToday(date) && "flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
          )}
        >
          {day}
        </span>
        {highlight?.label && <span className={cn("truncate text-[0.625rem]", dayHighlightTextClass(highlight.color))}>{highlight.label}</span>}
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-sm">
        {HOURS.map((hour) => {
          const count = counts?.[hour] ?? 0;
          const intensity = count > 0 ? 0.15 + 0.85 * (Math.min(count, max) / max) : 0;
          return (
            <div
              key={hour}
              title={`${String(hour).padStart(2, "0")}:00 · ${count}`}
              className={cn("h-full flex-1", count === 0 ? "bg-muted" : "bg-primary")}
              style={count > 0 ? { opacity: intensity } : undefined}
            />
          );
        })}
      </div>

      {renderDayBadge && <div className="mt-auto flex flex-wrap gap-1">{renderDayBadge(date)}</div>}
    </button>
  );
}
