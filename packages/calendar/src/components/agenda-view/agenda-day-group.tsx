import { differenceInDays, startOfDay } from "date-fns";

import { formatDate } from "../../lib/date-formats";
import { useCalendarTranslation } from "../../lib/use-calendar-translation";
import type { CalendarItem } from "../../model/types";
import { AgendaItemCard } from "./agenda-item-card";

interface AgendaDayGroupProps {
  date: Date;
  items: CalendarItem[];
  multiDayItems: CalendarItem[];
}

export function AgendaDayGroup({ date, items, multiDayItems }: AgendaDayGroupProps) {
  const { language, locale } = useCalendarTranslation();
  const sortedItems = [...items].sort((a, b) => a.start.getTime() - b.start.getTime());

  return (
    <div className="space-y-4">
      <div className="sticky top-0 flex items-center gap-4 bg-background py-2">
        <p className="text-sm font-semibold">{formatDate(date, "dateTime", language, locale)}</p>
      </div>

      <div className="space-y-2">
        {multiDayItems.map((item) => {
          const itemStart = startOfDay(item.start);
          const itemEnd = startOfDay(item.end);
          const currentDate = startOfDay(date);

          const itemTotalDays = differenceInDays(itemEnd, itemStart) + 1;
          const itemCurrentDay = differenceInDays(currentDate, itemStart) + 1;

          return <AgendaItemCard key={item.id} item={item} itemCurrentDay={itemCurrentDay} itemTotalDays={itemTotalDays} />;
        })}

        {sortedItems.map((item) => (
          <AgendaItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
