import { endOfDay, isSameDay, startOfDay } from "date-fns";

import { cn } from "../../lib/cn";
import { patternClass } from "../../helpers";
import { itemColorClass } from "../../lib/item-colors";
import { formatTime } from "../../lib/date-formats";
import { useCalendarData, useCalendarPreferences } from "../../context/calendar-context";
import { useCalendarTranslation } from "../../lib/use-calendar-translation";
import type { CalendarItem } from "../../model/types";
import { DraggableItem } from "../dnd/draggable-item";

const BADGE_BASE =
  "mx-1 flex h-[26px] w-auto select-none items-center justify-between gap-1.5 truncate whitespace-nowrap rounded-md border px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const MULTI_DAY_POSITION: Record<"first" | "middle" | "last" | "none", string> = {
  first: "relative z-10 mr-0 w-[calc(100%_-_3px)] rounded-r-none border-r-0 [&>span]:mr-2.5",
  middle: "relative z-10 mx-0 w-[calc(100%_+_1px)] rounded-none border-x-0",
  last: "ml-0 rounded-l-none border-l-0",
  none: "",
};

interface MonthItemBadgeProps {
  item: CalendarItem;
  cellDate: Date;
  itemCurrentDay?: number;
  itemTotalDays?: number;
  className?: string;
  position?: "first" | "middle" | "last" | "none";
}

/** A month-grid item chip. Handles single- and multi-day rendering positions. */
export function MonthItemBadge({ item, cellDate, itemCurrentDay, itemTotalDays, className, position: propPosition }: MonthItemBadgeProps) {
  const { badgeVariant } = useCalendarPreferences();
  const { onItemClick } = useCalendarData();
  const { t, language, locale } = useCalendarTranslation();

  const itemStart = startOfDay(item.start);
  const itemEnd = endOfDay(item.end);

  if (cellDate < itemStart || cellDate > itemEnd) return null;

  let position: "first" | "middle" | "last" | "none";
  if (propPosition) {
    position = propPosition;
  } else if (itemCurrentDay && itemTotalDays) {
    position = "none";
  } else if (isSameDay(itemStart, itemEnd)) {
    position = "none";
  } else if (isSameDay(cellDate, itemStart)) {
    position = "first";
  } else if (isSameDay(cellDate, itemEnd)) {
    position = "last";
  } else {
    position = "middle";
  }

  const renderBadgeText = position === "first" || position === "none";

  const badgeClasses = cn(
    BADGE_BASE,
    itemColorClass(item.color, badgeVariant),
    MULTI_DAY_POSITION[position],
    patternClass(item.pattern),
    className
  );

  // Stop propagation so an enclosing clickable day cell does not also fire.
  const activate = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onItemClick?.(item);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate(e);
    }
  };

  return (
    <DraggableItem item={item}>
      <div role="button" tabIndex={0} className={badgeClasses} onClick={activate} onKeyDown={handleKeyDown}>
        <div className="flex items-center gap-1.5 truncate">
          {position !== "middle" && position !== "last" && (badgeVariant === "mixed" || badgeVariant === "dot") && (
            <svg width="8" height="8" viewBox="0 0 8 8" className="event-dot shrink-0">
              <circle cx="4" cy="4" r="4" />
            </svg>
          )}

          {renderBadgeText && (
            <p className="flex-1 truncate font-semibold">
              {itemCurrentDay && itemTotalDays && (
                <span className="text-xs">{t("events.dayCount", { current: itemCurrentDay, total: itemTotalDays })} • </span>
              )}
              {item.title}
            </p>
          )}
        </div>

        {renderBadgeText && !item.allDay && <span>{formatTime(item.start, language, locale)}</span>}
      </div>
    </DraggableItem>
  );
}
