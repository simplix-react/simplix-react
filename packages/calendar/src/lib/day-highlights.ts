import { useMemo } from "react";

import { useCalendarData } from "../context/calendar-context";
import type { DayHighlight } from "../model/types";

/** Stable `"yyyy-MM-dd"` key for a local date. */
export function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Index day highlights by their date key for O(1) lookup. */
export function buildDayHighlightMap(highlights: DayHighlight[] | undefined): Map<string, DayHighlight> {
  const map = new Map<string, DayHighlight>();
  (highlights ?? []).forEach((highlight) => map.set(highlight.date, highlight));
  return map;
}

/** Memoized day-highlight lookup drawn from the provider's `dayHighlights`. */
export function useDayHighlights(): Map<string, DayHighlight> {
  const { dayHighlights } = useCalendarData();
  return useMemo(() => buildDayHighlightMap(dayHighlights), [dayHighlights]);
}
