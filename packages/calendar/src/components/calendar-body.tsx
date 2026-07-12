import { useMemo } from "react";
import {
  eachDayOfInterval,
  isSameDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfYear,
  endOfYear,
} from "date-fns";
import type { Locale } from "date-fns";

import { useCalendarData, useCalendarDate, useCalendarResourceFilter, useCalendarView, useEffectiveRangeView } from "../context/calendar-context";
import { useCalendarTranslation } from "../lib/use-calendar-translation";
import type { CalendarItem, CalendarView } from "../model/types";
import { DndProviderWrapper } from "./dnd/dnd-provider";
import { CalendarMonthView } from "./month-view/calendar-month-view";
import { CalendarWeekView } from "./week-and-day-view/calendar-week-view";
import { CalendarDayView } from "./week-and-day-view/calendar-day-view";
import { CalendarYearView } from "./year-view/calendar-year-view";
import { CalendarAgendaView } from "./agenda-view/calendar-agenda-view";
import { ResourceTimelineView } from "./resource-timeline/resource-timeline-view";
import { HeatmapMonthView } from "./heatmap-view/heatmap-month-view";
import { GanttView } from "./gantt-view/gantt-view";

function viewWindow(view: CalendarView, date: Date, locale: Locale): { start: Date; end: Date } {
  switch (view) {
    case "day":
    case "gantt-day":
    case "resource-timeline":
      return { start: startOfDay(date), end: endOfDay(date) };
    case "week":
    case "gantt-week":
      return { start: startOfWeek(date, { locale }), end: endOfWeek(date, { locale }) };
    case "year":
      return { start: startOfYear(date), end: endOfYear(date) };
    case "month":
    case "agenda":
    case "heatmap-month":
    default:
      return { start: startOfMonth(date), end: endOfMonth(date) };
  }
}

/**
 * Renders the active view. Filters items to the visible window and selected
 * resource, splits them into single/multi-day sets, and enables dnd when requested.
 */
export function CalendarBody() {
  const { items, dndEnabled } = useCalendarData();
  const { selectedResourceId } = useCalendarResourceFilter();
  const { selectedDate } = useCalendarDate();
  const { currentView } = useCalendarView();
  const { effectiveView } = useEffectiveRangeView();
  const { locale } = useCalendarTranslation();

  const filteredItems = useMemo(() => {
    const { start, end } = viewWindow(effectiveView, selectedDate, locale);
    return items.filter((item) => {
      const inWindow = item.start <= end && item.end >= start;
      const matchesResource = selectedResourceId === "all" || item.resourceId === selectedResourceId;
      return inWindow && matchesResource;
    });
  }, [items, effectiveView, selectedDate, selectedResourceId, locale]);

  const { singleDayItems, multiDayItems } = useMemo(() => {
    const single: CalendarItem[] = [];
    const multi: CalendarItem[] = [];
    for (const item of filteredItems) {
      if (isSameDay(item.start, item.end)) single.push(item);
      else multi.push(item);
    }
    return { singleDayItems: single, multiDayItems: multi };
  }, [filteredItems]);

  const ganttDays = useMemo(() => {
    if (currentView !== "gantt-day" && currentView !== "gantt-week") return [];
    const { start, end } = viewWindow(currentView, selectedDate, locale);
    return eachDayOfInterval({ start, end });
  }, [currentView, selectedDate, locale]);

  const content = (
    <>
      {currentView === "month" && <CalendarMonthView singleDayItems={singleDayItems} multiDayItems={multiDayItems} />}
      {currentView === "week" && <CalendarWeekView singleDayItems={singleDayItems} multiDayItems={multiDayItems} />}
      {currentView === "day" && <CalendarDayView singleDayItems={singleDayItems} multiDayItems={multiDayItems} />}
      {currentView === "year" && <CalendarYearView allItems={filteredItems} />}
      {currentView === "agenda" && <CalendarAgendaView singleDayItems={singleDayItems} multiDayItems={multiDayItems} />}
      {currentView === "resource-timeline" && <ResourceTimelineView items={filteredItems} />}
      {currentView === "heatmap-month" && <HeatmapMonthView />}
      {(currentView === "gantt-day" || currentView === "gantt-week") && (
        <GanttView items={filteredItems} days={ganttDays} />
      )}
    </>
  );

  if (dndEnabled) return <DndProviderWrapper>{content}</DndProviderWrapper>;
  return content;
}
