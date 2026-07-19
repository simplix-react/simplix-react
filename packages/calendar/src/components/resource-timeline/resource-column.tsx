import { Badge } from "@simplix-react/ui";

import { cn } from "../../lib/cn";
import { patternClass } from "../../helpers";
import { dotBgClass, timelineBarClass } from "../../lib/item-colors";
import { dateToMinutes, minutesToPercent } from "../../lib/time-axis";
import { useCalendarData } from "../../context/calendar-context";
import type { CalendarItem, CalendarResource } from "../../model/types";
import { ResourceAvatar } from "../resource-avatar";

interface ResourceColumnProps {
  resource: CalendarResource;
  items: CalendarItem[];
  day: Date;
  left: number;
  width: number;
  headerHeight: number;
  bodyHeight: number;
  firstHour: number;
  lastHour: number;
}

function isMarker(item: CalendarItem): boolean {
  return item.start.getTime() === item.end.getTime();
}

/** One resource column: sticky header + a vertical bar/marker stack on the shared time axis. */
export function ResourceColumn({ resource, items, day, left, width, headerHeight, bodyHeight, firstHour, lastHour }: ResourceColumnProps) {
  const { onItemClick, onCellClick, onResourceClick } = useCalendarData();

  const activateItem = (item: CalendarItem) => (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onItemClick?.(item);
  };

  return (
    <div className="absolute top-0 border-r" style={{ left, width, height: headerHeight + bodyHeight }}>
      <button
        type="button"
        onClick={() => onResourceClick?.(resource)}
        className="sticky top-0 z-20 flex w-full items-center gap-1.5 border-b bg-background px-2 hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        style={{ height: headerHeight }}
      >
        <ResourceAvatar name={resource.name} src={resource.avatarUrl} fallbackSrc={resource.avatarFallbackUrl} className="size-5" />
        <span className="truncate text-xs font-semibold">{resource.name}</span>
        {resource.badge && (
          <Badge variant="secondary" className="shrink-0 px-1 py-0 text-[0.625rem]">
            {resource.badge}
          </Badge>
        )}
      </button>

      <div className="relative w-full" style={{ height: bodyHeight }}>
        <button
          type="button"
          aria-label={resource.name}
          onClick={() => onCellClick?.(day)}
          className="absolute inset-0 z-0 size-full cursor-pointer"
        />
        {items.map((item) => {
          if (isMarker(item)) {
            const top = minutesToPercent(dateToMinutes(item.start), firstHour, lastHour);
            return (
              <span
                key={item.id}
                role="button"
                tabIndex={0}
                title={item.title}
                onClick={activateItem(item)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && activateItem(item)(e)}
                className={cn(
                  "absolute left-1/2 z-20 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background",
                  dotBgClass(item.color)
                )}
                style={{ top: `${top}%` }}
              />
            );
          }

          const top = minutesToPercent(dateToMinutes(item.start), firstHour, lastHour);
          const bottom = minutesToPercent(dateToMinutes(item.end), firstHour, lastHour);
          const height = Math.max(bottom - top, 1.5);

          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={activateItem(item)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && activateItem(item)(e)}
              className={cn(
                "absolute inset-x-1 z-10 overflow-hidden rounded-md border px-1 text-[0.625rem] leading-tight",
                timelineBarClass(item.color),
                patternClass(item.pattern)
              )}
              style={{ top: `${top}%`, height: `${height}%` }}
            >
              <span className="truncate font-medium">{item.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
