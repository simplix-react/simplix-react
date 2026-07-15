import { useMemo } from "react";
import { CalendarX2 } from "lucide-react";
import { format, endOfDay, startOfDay, isSameMonth, isSameYear } from "date-fns";

import { useCalendarDate, useEffectiveRangeView } from "../../context/calendar-context";
import { useCalendarTranslation } from "../../lib/use-calendar-translation";
import type { CalendarItem } from "../../model/types";
import { AgendaDayGroup } from "./agenda-day-group";

interface CalendarAgendaViewProps {
  singleDayItems: CalendarItem[];
  multiDayItems: CalendarItem[];
}

export function CalendarAgendaView({ singleDayItems, multiDayItems }: CalendarAgendaViewProps) {
  const { selectedDate } = useCalendarDate();
  const { agendaScope } = useEffectiveRangeView();
  const { t } = useCalendarTranslation();

  const itemsByDay = useMemo(() => {
    const inScope = agendaScope === "year" ? isSameYear : isSameMonth;
    const allDates = new Map<string, { date: Date; items: CalendarItem[]; multiDayItems: CalendarItem[] }>();

    singleDayItems.forEach((item) => {
      if (!inScope(item.start, selectedDate)) return;
      const dateKey = format(item.start, "yyyy-MM-dd");
      if (!allDates.has(dateKey)) {
        allDates.set(dateKey, { date: startOfDay(item.start), items: [], multiDayItems: [] });
      }
      allDates.get(dateKey)?.items.push(item);
    });

    multiDayItems.forEach((item) => {
      let currentDate = startOfDay(item.start);
      const lastDate = endOfDay(item.end);

      while (currentDate <= lastDate) {
        if (inScope(currentDate, selectedDate)) {
          const dateKey = format(currentDate, "yyyy-MM-dd");
          if (!allDates.has(dateKey)) {
            allDates.set(dateKey, { date: new Date(currentDate), items: [], multiDayItems: [] });
          }
          allDates.get(dateKey)?.multiDayItems.push(item);
        }
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }
    });

    return Array.from(allDates.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [singleDayItems, multiDayItems, selectedDate, agendaScope]);

  const hasAnyItems = singleDayItems.length > 0 || multiDayItems.length > 0;

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-4">
        {itemsByDay.map((dayGroup) => (
          <AgendaDayGroup
            key={format(dayGroup.date, "yyyy-MM-dd")}
            date={dayGroup.date}
            items={dayGroup.items}
            multiDayItems={dayGroup.multiDayItems}
          />
        ))}

        {!hasAnyItems && (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
            <CalendarX2 className="size-10" />
            <p className="text-sm md:text-base">
              {t(agendaScope === "year" ? "events.noEventsScheduledYear" : "events.noEventsScheduled")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
