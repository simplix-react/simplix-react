import { useMemo } from "react";
import { isToday, startOfDay } from "date-fns";

import { cn } from "../../lib/cn";
import { useCalendarData } from "../../context/calendar-context";
import { getMonthCellItems } from "../../helpers";
import { dayHighlightBgClass, dayHighlightTextClass } from "../../lib/item-colors";
import { dayKey, useDayHighlights } from "../../lib/day-highlights";
import type { CalendarCell, CalendarItem } from "../../model/types";
import { EventBullet } from "./event-bullet";
import { MonthItemBadge } from "./month-item-badge";
import { DroppableDayCell } from "../dnd/droppable-day-cell";

interface DayCellProps {
  cell: CalendarCell;
  items: CalendarItem[];
  itemPositions: Record<string, number>;
}

const MAX_VISIBLE_ITEMS = 3;

export function DayCell({ cell, items, itemPositions }: DayCellProps) {
  const { day, currentMonth, date } = cell;
  const { onCellClick, onItemClick, renderDayContent } = useCalendarData();

  const cellItems = useMemo(() => getMonthCellItems(date, items, itemPositions), [date, items, itemPositions]);
  const isSunday = date.getDay() === 0;

  const highlights = useDayHighlights();
  const highlight = highlights.get(dayKey(date));

  return (
    <DroppableDayCell cell={cell}>
      <div
        className={cn(
          "flex h-full flex-col gap-1 border-l border-t py-1.5 lg:py-2",
          isSunday && "border-l-0",
          highlight && dayHighlightBgClass(highlight.color),
          onCellClick && "cursor-pointer hover:bg-accent/40"
        )}
        onClick={onCellClick ? () => onCellClick(date) : undefined}
      >
        <div className="flex items-center justify-between gap-1 pr-1.5">
          <span
            className={cn(
              "h-6 px-1 text-xs font-semibold lg:px-2",
              !currentMonth && "opacity-20",
              isToday(date) && "flex w-6 translate-x-1 items-center justify-center rounded-full bg-primary px-0 font-bold text-primary-foreground"
            )}
          >
            {day}
          </span>
          {highlight?.label && <span className={cn("truncate text-[0.625rem]", dayHighlightTextClass(highlight.color))}>{highlight.label}</span>}
        </div>

        {renderDayContent ? (
          <div className={cn("min-h-6 flex-1 overflow-hidden px-1.5", !currentMonth && "opacity-50")}>
            {renderDayContent(date, cellItems)}
          </div>
        ) : (
          <>
            <div className={cn("flex h-6 gap-1 px-2 lg:h-[94px] lg:flex-col lg:gap-2 lg:px-0", !currentMonth && "opacity-50")}>
              {[0, 1, 2].map((position) => {
                const item = cellItems.find((candidate) => candidate.position === position);
                const key = item ? `item-${item.id}-${position}` : `empty-${position}`;

                return (
                  <div key={key} className="lg:flex-1">
                    {item && (
                      <>
                        {/* Below lg only the bullet renders; it must activate the item, not the cell. */}
                        <span
                          className="lg:hidden"
                          onClick={(e) => {
                            e.stopPropagation();
                            onItemClick?.(item);
                          }}
                        >
                          <EventBullet color={item.color} />
                        </span>
                        <MonthItemBadge className="hidden lg:flex" item={item} cellDate={startOfDay(date)} />
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {cellItems.length > MAX_VISIBLE_ITEMS && (
              <p className={cn("h-[18px] px-1.5 text-xs font-semibold text-muted-foreground", !currentMonth && "opacity-50")}>
                +{cellItems.length - MAX_VISIBLE_ITEMS}
              </p>
            )}
          </>
        )}
      </div>
    </DroppableDayCell>
  );
}
