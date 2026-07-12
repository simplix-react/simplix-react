import type { CalendarItem, CalendarResource, DayHighlight, HeatmapCell, TimeBand } from "../model/types";

/** Fixed month/day used by tests so item windows are deterministic. */
export const FIXED_DATE = new Date(2026, 6, 15); // 2026-07-15

export const RESOURCES: CalendarResource[] = [
  { id: "r1", name: "Ada Lovelace", badge: "Day" },
  { id: "r2", name: "Grace Hopper", badge: "Night" },
];

export const ITEMS: CalendarItem[] = [
  {
    id: "i1",
    title: "Standup Sync",
    start: new Date(2026, 6, 10, 9, 0),
    end: new Date(2026, 6, 10, 9, 30),
    color: "blue",
    resourceId: "r1",
    payload: { kind: "meeting" },
  },
  {
    id: "i2",
    title: "Design Review",
    start: new Date(2026, 6, 12, 14, 0),
    end: new Date(2026, 6, 12, 15, 0),
    color: "teal",
    resourceId: "r2",
    payload: { kind: "review" },
  },
  {
    id: "i3",
    title: "Release Window",
    start: new Date(2026, 6, 18, 8, 0),
    end: new Date(2026, 6, 20, 18, 0),
    color: "orange",
    resourceId: "r1",
    payload: { kind: "release" },
  },
];

/** Same-day segments and a zero-duration marker on FIXED_DATE for the timeline view. */
export const TIMELINE_ITEMS: CalendarItem[] = [
  {
    id: "t1",
    title: "Regular Shift",
    start: new Date(2026, 6, 15, 9, 0),
    end: new Date(2026, 6, 15, 12, 0),
    color: "blue",
    resourceId: "r1",
    payload: {},
  },
  {
    id: "t2",
    title: "Overtime",
    start: new Date(2026, 6, 15, 13, 0),
    end: new Date(2026, 6, 15, 15, 0),
    color: "orange",
    resourceId: "r2",
    payload: {},
  },
  {
    id: "t3",
    title: "Check-in",
    start: new Date(2026, 6, 15, 9, 0),
    end: new Date(2026, 6, 15, 9, 0),
    color: "green",
    resourceId: "r1",
    payload: {},
  },
];

export const TIME_BANDS: TimeBand[] = [
  { start: "09:00", end: "18:00", kind: "recognized" },
  { start: "10:00", end: "15:00", kind: "core" },
];

export const HEATMAP: HeatmapCell[] = [
  { date: "2026-07-15", hour: 9, count: 5 },
  { date: "2026-07-15", hour: 10, count: 3 },
  { date: "2026-07-16", hour: 9, count: 2 },
];

export const DAY_HIGHLIGHTS: DayHighlight[] = [{ date: "2026-07-15", color: "red", label: "Holiday" }];
