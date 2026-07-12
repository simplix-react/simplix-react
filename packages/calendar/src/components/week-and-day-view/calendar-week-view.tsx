import { useEffect, useMemo, useRef, useState } from "react";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";

import { useCalendarData, useCalendarDate, useCalendarPreferences, useCalendarSelector } from "../../context/calendar-context";
import { useCalendarTranslation } from "../../lib/use-calendar-translation";
import { groupItems, getVisibleHours } from "../../helpers";
import { dayHighlightBgClass } from "../../lib/item-colors";
import { dayKey, useDayHighlights } from "../../lib/day-highlights";
import type { CalendarItem } from "../../model/types";
import { CalendarTimeline } from "./calendar-time-line";
import { HourLabels } from "./hour-labels";
import { TimeGridColumn } from "./time-grid-column";
import { WeekViewMultiDayRow } from "./week-view-multi-day-row";
import { DayHighlightBadge } from "../day-highlight-badge";
import { DEFAULT_HOUR_PX, TimeGridProvider } from "./time-grid-context";

/** Smallest usable row height when fitting hours into the body. */
const MIN_FIT_HOUR_PX = 20;

interface CalendarWeekViewProps {
  singleDayItems: CalendarItem[];
  multiDayItems: CalendarItem[];
}

export function CalendarWeekView({ singleDayItems, multiDayItems }: CalendarWeekViewProps) {
  const { selectedDate } = useCalendarDate();
  const { workingHours, visibleHours } = useCalendarPreferences();
  const hourHeight = useCalendarSelector((s) => s.hourHeight);
  const { renderWeekDayHeader } = useCalendarData();
  const { t, locale } = useCalendarTranslation();

  const { hours, earliestItemHour, latestItemHour } = getVisibleHours(visibleHours, singleDayItems);

  // "fit" scales rows so the full hour window fills the body height.
  const isFit = hourHeight === "fit";
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [bodyHeight, setBodyHeight] = useState(0);
  useEffect(() => {
    if (!isFit || !bodyRef.current) return;
    const element = bodyRef.current;
    const observer = new ResizeObserver((entries) => setBodyHeight(entries[0]?.contentRect.height ?? 0));
    observer.observe(element);
    return () => observer.disconnect();
  }, [isFit]);

  const hourPx = isFit
    ? Math.max(MIN_FIT_HOUR_PX, Math.floor((bodyHeight || 0) / Math.max(1, hours.length)))
    : typeof hourHeight === "number"
      ? hourHeight
      : DEFAULT_HOUR_PX;

  const weekStart = startOfWeek(selectedDate, { locale });
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const dayGroups = useMemo(
    () => weekDays.map((day) => groupItems(singleDayItems.filter((item) => isSameDay(item.start, day) || isSameDay(item.end, day)))),
    [weekDays, singleDayItems]
  );

  const highlights = useDayHighlights();

  return (
    <>
      <div className="flex flex-col items-center justify-center border-b py-4 text-sm text-muted-foreground sm:hidden">
        <p>{t("weekView.notAvailableOnMobile")}</p>
        <p>{t("weekView.switchToOtherView")}</p>
      </div>

      <div className={`hidden flex-col sm:flex ${isFit ? "h-full min-h-0" : ""}`}>
        <div>
          <WeekViewMultiDayRow selectedDate={selectedDate} multiDayItems={multiDayItems} />

          <div className="relative z-20 flex border-b">
            <div className="w-[72px]" />
            <div className="grid flex-1 grid-cols-7 divide-x border-l">
              {weekDays.map((day, index) => {
                const highlight = highlights.get(dayKey(day));
                return (
                  <div key={index} className="flex flex-col items-center gap-1 py-2 text-xs font-medium text-muted-foreground">
                    <span>
                      {format(day, "EE", { locale })} <span className="ml-1 font-semibold text-foreground">{format(day, "d", { locale })}</span>
                    </span>
                    {highlight && <DayHighlightBadge color={highlight.color} label={highlight.label ?? ""} />}
                    {renderWeekDayHeader?.(day)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div ref={bodyRef} className={isFit ? "min-h-0 flex-1 overflow-y-auto" : "h-[736px] overflow-y-auto"}>
          <TimeGridProvider value={hourPx}>
            <div className="flex">
              <HourLabels hours={hours} />

              <div className="relative flex-1 border-l">
                <div className="grid grid-cols-7 divide-x">
                  {weekDays.map((day, dayIndex) => {
                    const highlight = highlights.get(dayKey(day));
                    return (
                      <TimeGridColumn
                        key={dayIndex}
                        day={day}
                        hours={hours}
                        workingHours={workingHours}
                        groupedItems={dayGroups[dayIndex]}
                        visibleRange={{ from: earliestItemHour, to: latestItemHour }}
                        highlightBgClass={highlight ? dayHighlightBgClass(highlight.color) : undefined}
                      />
                    );
                  })}
                </div>

                <CalendarTimeline firstVisibleHour={earliestItemHour} lastVisibleHour={latestItemHour} />
              </div>
            </div>
          </TimeGridProvider>
        </div>
      </div>
    </>
  );
}
