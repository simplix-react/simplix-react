import { Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";

import { useCalendarData, useCalendarDate, useCalendarPreferences } from "../../context/calendar-context";
import { useCalendarTranslation } from "../../lib/use-calendar-translation";
import { formatDate, formatTimeRange } from "../../lib/date-formats";
import { groupItems, getVisibleHours, getCurrentItems } from "../../helpers";
import { dayHighlightBgClass } from "../../lib/item-colors";
import { dayKey, useDayHighlights } from "../../lib/day-highlights";
import type { CalendarItem } from "../../model/types";
import { CalendarTimeline } from "./calendar-time-line";
import { DayViewMultiDayRow } from "./day-view-multi-day-row";
import { HourLabels } from "./hour-labels";
import { TimeGridColumn } from "./time-grid-column";
import { DayHighlightBadge } from "../day-highlight-badge";

interface CalendarDayViewProps {
  singleDayItems: CalendarItem[];
  multiDayItems: CalendarItem[];
}

export function CalendarDayView({ singleDayItems, multiDayItems }: CalendarDayViewProps) {
  const { selectedDate } = useCalendarDate();
  const { visibleHours, workingHours } = useCalendarPreferences();
  const { resourceById } = useCalendarData();
  const { t, language, locale } = useCalendarTranslation();

  const { hours, earliestItemHour, latestItemHour } = getVisibleHours(visibleHours, singleDayItems);
  const currentItems = getCurrentItems(singleDayItems);

  const highlights = useDayHighlights();
  const highlight = highlights.get(dayKey(selectedDate));

  const dayItems = singleDayItems.filter(
    (item) =>
      item.start.getDate() === selectedDate.getDate() &&
      item.start.getMonth() === selectedDate.getMonth() &&
      item.start.getFullYear() === selectedDate.getFullYear()
  );

  const groupedItems = groupItems(dayItems);

  return (
    <div className="flex">
      <div className="flex flex-1 flex-col">
        <div>
          <DayViewMultiDayRow selectedDate={selectedDate} multiDayItems={multiDayItems} />

          <div className="relative z-20 flex border-b">
            <div className="w-[72px]" />
            <div className="flex flex-1 items-center justify-center gap-2 border-l py-2 text-xs font-medium text-muted-foreground">
              <span>
                {format(selectedDate, "EE", { locale })} <span className="font-semibold text-foreground">{format(selectedDate, "d", { locale })}</span>
              </span>
              {highlight && <DayHighlightBadge color={highlight.color} label={highlight.label ?? ""} />}
            </div>
          </div>
        </div>

        <div className="h-[800px] overflow-y-auto">
          <div className="flex">
            <HourLabels hours={hours} />

            <div className="relative flex-1 border-l">
              <TimeGridColumn
                day={selectedDate}
                hours={hours}
                workingHours={workingHours}
                groupedItems={groupedItems}
                visibleRange={{ from: earliestItemHour, to: latestItemHour }}
                highlightBgClass={highlight ? dayHighlightBgClass(highlight.color) : undefined}
              />
              <CalendarTimeline firstVisibleHour={earliestItemHour} lastVisibleHour={latestItemHour} />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden w-64 divide-y border-l md:block">
        <div className="flex-1 space-y-3">
          {currentItems.length > 0 ? (
            <div className="flex items-start gap-2 px-4 pt-4">
              <span className="relative mt-[5px] flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-green-600" />
              </span>
              <p className="text-sm font-semibold text-foreground">{t("dayView.happeningNow")}</p>
            </div>
          ) : (
            <p className="p-4 text-center text-sm italic text-muted-foreground">{t("dayView.noAppointments")}</p>
          )}

          {currentItems.length > 0 && (
            <div className="h-[422px] overflow-y-auto px-4">
              <div className="space-y-6 pb-4">
                {currentItems.map((item) => {
                  const resource = item.resourceId ? resourceById.get(item.resourceId) : undefined;

                  return (
                    <div key={item.id} className="space-y-1.5">
                      <p className="line-clamp-2 text-sm font-semibold">{item.title}</p>

                      {resource && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="size-3.5" />
                          <span className="text-sm">{resource.name}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="size-3.5" />
                        <span className="text-sm">{formatDate(new Date(), "fullDate", language, locale)}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="size-3.5" />
                        <span className="text-sm">{formatTimeRange(item.start, item.end, language, locale)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
