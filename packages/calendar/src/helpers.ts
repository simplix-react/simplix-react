import {
  addDays,
  addMonths,
  addWeeks,
  subDays,
  subMonths,
  subWeeks,
  isSameWeek,
  isSameDay,
  isSameMonth,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  differenceInMinutes,
  eachDayOfInterval,
  startOfDay,
  endOfDay,
  differenceInDays,
  endOfYear,
  startOfYear,
  subYears,
  addYears,
  isSameYear,
  isWithinInterval,
} from "date-fns";
import type { Locale } from "date-fns";

import { formatDate, formatDateRange } from "./lib/date-formats";
import type { CalendarCell, CalendarItem, CalendarView, EventPattern, VisibleHours, WorkingHours } from "./model/types";

// ================ Header helper functions ================ //

/** Human-readable range label for the header (locale-aware). */
export function rangeText(view: CalendarView, date: Date, language: string, locale: Locale): string {
  let start: Date;
  let end: Date;

  switch (view) {
    case "agenda":
    case "month":
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    case "year":
      start = startOfYear(date);
      end = endOfYear(date);
      break;
    case "week":
    case "gantt-week":
      start = startOfWeek(date, { locale });
      end = endOfWeek(date, { locale });
      break;
    case "day":
    case "gantt-day":
      return formatDate(date, "fullDate", language, locale);
    default:
      return "";
  }

  if (view === "year") {
    return formatDate(start, "yearRange", language, locale);
  }

  return formatDateRange(start, end, language, locale);
}

/** Step the selected date one unit forward/back for the active view. */
export function navigateDate(date: Date, view: CalendarView, direction: "previous" | "next"): Date {
  const operations: Record<CalendarView, (date: Date, amount: number) => Date> = {
    agenda: direction === "next" ? addMonths : subMonths,
    year: direction === "next" ? addYears : subYears,
    month: direction === "next" ? addMonths : subMonths,
    "heatmap-month": direction === "next" ? addMonths : subMonths,
    week: direction === "next" ? addWeeks : subWeeks,
    "gantt-week": direction === "next" ? addWeeks : subWeeks,
    day: direction === "next" ? addDays : subDays,
    "gantt-day": direction === "next" ? addDays : subDays,
    "resource-timeline": direction === "next" ? addDays : subDays,
  };

  return operations[view](date, 1);
}

/** Count items that fall in the same period as `date` for the given view. */
export function getItemsCount(items: CalendarItem[], date: Date, view: CalendarView, locale: Locale): number {
  const compareFns: Record<CalendarView, (d1: Date, d2: Date) => boolean> = {
    agenda: isSameMonth,
    year: isSameYear,
    day: isSameDay,
    "gantt-day": isSameDay,
    "resource-timeline": isSameDay,
    week: (d1: Date, d2: Date) => isSameWeek(d1, d2, { locale }),
    "gantt-week": (d1: Date, d2: Date) => isSameWeek(d1, d2, { locale }),
    month: isSameMonth,
    "heatmap-month": isSameMonth,
  };

  return items.filter((item) => compareFns[view](item.start, date)).length;
}

/** Inclusive date range currently visible for a view (drives `onRangeChange`). */
export function getViewDateRange(view: CalendarView, date: Date, locale?: Locale): { start: Date; end: Date } {
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

// ================ Week and day view helper functions ================ //

/** Items overlapping "now" (used by the day view side panel). */
export function getCurrentItems(items: CalendarItem[]): CalendarItem[] {
  const now = new Date();
  return items.filter((item) => isWithinInterval(now, { start: item.start, end: item.end }));
}

/** Greedily lane items that do not overlap into shared columns. */
export function groupItems(dayItems: CalendarItem[]): CalendarItem[][] {
  const sortedItems = [...dayItems].sort((a, b) => a.start.getTime() - b.start.getTime());
  const groups: CalendarItem[][] = [];

  for (const item of sortedItems) {
    let placed = false;
    for (const group of groups) {
      const lastItemInGroup = group[group.length - 1];
      if (item.start >= lastItemInGroup.end) {
        group.push(item);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([item]);
  }

  return groups;
}

/** Absolute-position style for a timed item block within the day/week grid. */
export function getItemBlockStyle(
  item: CalendarItem,
  day: Date,
  groupIndex: number,
  groupSize: number,
  visibleHoursRange?: { from: number; to: number }
) {
  const dayStart = new Date(new Date(day).setHours(0, 0, 0, 0));
  const itemStart = item.start < dayStart ? dayStart : item.start;
  const startMinutes = differenceInMinutes(itemStart, dayStart);

  let top: number;
  if (visibleHoursRange) {
    const visibleStartMinutes = visibleHoursRange.from * 60;
    const visibleEndMinutes = visibleHoursRange.to * 60;
    const visibleRangeMinutes = visibleEndMinutes - visibleStartMinutes;
    top = ((startMinutes - visibleStartMinutes) / visibleRangeMinutes) * 100;
  } else {
    top = (startMinutes / 1440) * 100;
  }

  const width = 100 / groupSize;
  const left = groupIndex * width;

  return { top: `${top}%`, width: `${width}%`, left: `${left}%` };
}

/** Whether an hour cell is inside the configured working window for its weekday. */
export function isWorkingHour(day: Date, hour: number, workingHours: WorkingHours): boolean {
  const dayIndex = day.getDay() as keyof typeof workingHours;
  const dayHours = workingHours[dayIndex];
  return hour >= dayHours.from && hour < dayHours.to;
}

/** Expand the visible-hour window to include any items that fall outside it. */
export function getVisibleHours(visibleHours: VisibleHours, singleDayItems: CalendarItem[]) {
  let earliestItemHour = visibleHours.from;
  let latestItemHour = visibleHours.to;

  singleDayItems.forEach((item) => {
    const startHour = item.start.getHours();
    const endHour = item.end.getHours() + (item.end.getMinutes() > 0 ? 1 : 0);
    if (startHour < earliestItemHour) earliestItemHour = startHour;
    if (endHour > latestItemHour) latestItemHour = endHour;
  });

  latestItemHour = Math.min(latestItemHour, 24);

  const hours = Array.from({ length: latestItemHour - earliestItemHour }, (_, i) => i + earliestItemHour);

  return { hours, earliestItemHour, latestItemHour };
}

// ================ Month view helper functions ================ //

/** The full 7-column month grid (including leading/trailing days). */
export function getCalendarCells(selectedDate: Date, locale: Locale): CalendarCell[] {
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const weekStart = startOfWeek(firstDay, { locale });
    return differenceInDays(firstDay, weekStart);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);
  const totalDays = firstDayOfMonth + daysInMonth;

  const prevMonthCells = Array.from({ length: firstDayOfMonth }, (_, i) => ({
    day: daysInPrevMonth - firstDayOfMonth + i + 1,
    currentMonth: false,
    date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - firstDayOfMonth + i + 1),
  }));

  const currentMonthCells = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    currentMonth: true,
    date: new Date(currentYear, currentMonth, i + 1),
  }));

  const nextMonthCells = Array.from({ length: (7 - (totalDays % 7)) % 7 }, (_, i) => ({
    day: i + 1,
    currentMonth: false,
    date: new Date(currentYear, currentMonth + 1, i + 1),
  }));

  return [...prevMonthCells, ...currentMonthCells, ...nextMonthCells];
}

/** Assign each item a stable vertical slot (0–2) across the month grid. */
export function calculateMonthItemPositions(
  multiDayItems: CalendarItem[],
  singleDayItems: CalendarItem[],
  selectedDate: Date
): Record<string, number> {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  const itemPositions: Record<string, number> = {};
  const occupiedPositions: Record<string, boolean[]> = {};

  eachDayOfInterval({ start: monthStart, end: monthEnd }).forEach((day) => {
    occupiedPositions[day.toISOString()] = [false, false, false];
  });

  const sortedItems = [
    ...[...multiDayItems].sort((a, b) => {
      const aDuration = differenceInDays(a.end, a.start);
      const bDuration = differenceInDays(b.end, b.start);
      return bDuration - aDuration || a.start.getTime() - b.start.getTime();
    }),
    ...[...singleDayItems].sort((a, b) => a.start.getTime() - b.start.getTime()),
  ];

  sortedItems.forEach((item) => {
    const itemDays = eachDayOfInterval({
      start: item.start < monthStart ? monthStart : item.start,
      end: item.end > monthEnd ? monthEnd : item.end,
    });

    let position = -1;
    for (let i = 0; i < 3; i++) {
      if (
        itemDays.every((day) => {
          const dayPositions = occupiedPositions[startOfDay(day).toISOString()];
          return dayPositions && !dayPositions[i];
        })
      ) {
        position = i;
        break;
      }
    }

    if (position !== -1) {
      itemDays.forEach((day) => {
        const dayKey = startOfDay(day).toISOString();
        occupiedPositions[dayKey][position] = true;
      });
      itemPositions[item.id] = position;
    }
  });

  return itemPositions;
}

/** Items intersecting a specific month-grid day, tagged with slot/multi-day metadata. */
export function getMonthCellItems(
  date: Date,
  items: CalendarItem[],
  itemPositions: Record<string, number>
): (CalendarItem & { position: number; isMultiDay: boolean })[] {
  const itemsForDate = items.filter((item) => {
    return (date >= item.start && date <= item.end) || isSameDay(date, item.start) || isSameDay(date, item.end);
  });

  return itemsForDate
    .map((item) => ({
      ...item,
      position: itemPositions[item.id] ?? -1,
      isMultiDay: !isSameDay(item.start, item.end),
    }))
    .sort((a, b) => {
      if (a.isMultiDay && !b.isMultiDay) return -1;
      if (!a.isMultiDay && b.isMultiDay) return 1;
      return a.position - b.position;
    });
}

// ================ Appearance helpers ================ //

/** Extra classes for an item's optional render pattern (layered over the color fill). */
export function patternClass(pattern?: EventPattern): string {
  switch (pattern) {
    case "translucent":
      return "opacity-60";
    case "hatched":
      return "[background-image:repeating-linear-gradient(45deg,rgba(0,0,0,0.06)_0,rgba(0,0,0,0.06)_3px,transparent_3px,transparent_6px)] dark:[background-image:repeating-linear-gradient(45deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_3px,transparent_3px,transparent_6px)]";
    default:
      return "";
  }
}

/** Two-character initials for a resource avatar. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Returns the `yyyy-MM-dd` part of a backend date value. Backends serialize
 * date-only fields inconsistently (`"2026-01-01"` vs `"2026-01-01T00:00:00+09:00"`);
 * consumers must normalize before keying or constructing local dates.
 */
export function datePart(value: string): string {
  return value.slice(0, 10);
}

/** Formats a local date as `yyyy-MM-dd` without timezone shifting. */
export function toDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
