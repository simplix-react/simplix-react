import { Clock, User } from "lucide-react";

import { cn } from "../../lib/cn";
import { patternClass } from "../../helpers";
import { itemColorClass } from "../../lib/item-colors";
import { formatTimeRange } from "../../lib/date-formats";
import { useCalendarData, useCalendarPreferences } from "../../context/calendar-context";
import { useCalendarTranslation } from "../../lib/use-calendar-translation";
import type { CalendarItem } from "../../model/types";

const CARD_BASE =
  "flex select-none items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

interface AgendaItemCardProps {
  item: CalendarItem;
  itemCurrentDay?: number;
  itemTotalDays?: number;
}

/** A single item row inside an agenda day group. */
export function AgendaItemCard({ item, itemCurrentDay, itemTotalDays }: AgendaItemCardProps) {
  const { badgeVariant } = useCalendarPreferences();
  const { onItemClick, resourceById } = useCalendarData();
  const { t, language, locale } = useCalendarTranslation();

  // The per-item resource label only disambiguates multi-resource calendars;
  // with a single resource it repeats the same name on every row.
  const resource = item.resourceId && resourceById.size > 1 ? resourceById.get(item.resourceId) : undefined;
  const cardClasses = cn(CARD_BASE, itemColorClass(item.color, badgeVariant), patternClass(item.pattern));

  const activate = () => onItemClick?.(item);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate();
    }
  };

  return (
    <div role="button" tabIndex={0} className={cardClasses} onClick={activate} onKeyDown={handleKeyDown}>
      <div className="flex min-w-0 items-center gap-1.5">
        {(badgeVariant === "mixed" || badgeVariant === "dot") && (
          <svg width="8" height="8" viewBox="0 0 8 8" className="event-dot shrink-0">
            <circle cx="4" cy="4" r="4" />
          </svg>
        )}

        <p className="truncate font-medium">
          {itemCurrentDay && itemTotalDays && (
            <span className="mr-1 text-xs">{t("events.dayCount", { current: itemCurrentDay, total: itemTotalDays })} • </span>
          )}
          {item.title}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {resource && (
          <div className="flex items-center gap-1">
            <User className="size-3 shrink-0" />
            <p className="text-xs text-foreground">{resource.name}</p>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Clock className="size-3 shrink-0" />
          <p className="text-xs text-foreground">
            {item.allDay ? t("events.allDay") : formatTimeRange(item.start, item.end, language, locale)}
          </p>
        </div>
      </div>
    </div>
  );
}
