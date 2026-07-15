/** The set of calendar views the core can render. */
export type CalendarView =
  | "day"
  | "week"
  | "month"
  | "year"
  | "agenda"
  | "resource-timeline"
  | "heatmap-month"
  | "gantt-day"
  | "gantt-week";

/**
 * Full-width background band on the resource timeline axis. Times are `"HH:mm"`.
 * `recognized` renders a subtle tint; `core` renders a bordered band.
 */
export interface TimeBand {
  start: string;
  end: string;
  kind: "recognized" | "core";
}

/** One aggregate bucket for the heatmap month view. `date` is `"yyyy-MM-dd"`. */
export interface HeatmapCell {
  date: string;
  hour: number;
  count: number;
}

/**
 * Generic per-day emphasis (the mechanism consumers feed holidays into).
 * `date` is `"yyyy-MM-dd"`; applied as cell/axis shading and a header badge.
 */
export interface DayHighlight {
  date: string;
  color: CalendarColor;
  label?: string;
}

/** Color token applied to an item across every view. */
export type CalendarColor =
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "purple"
  | "orange"
  | "gray"
  | "teal";

/** Controls how month/week/day badges render their color marker. */
export type BadgeVariant = "dot" | "colored" | "mixed";

/** Render hint for future/specialized views; core applies a light visual treatment. */
export type EventPattern = "solid" | "hatched" | "translucent";

/** Per-weekday working-hour window (keyed by `Date.getDay()`, 0 = Sunday). */
export type WorkingHours = { [dayOfWeek: number]: { from: number; to: number } };

/** Inclusive/exclusive hour window shown in the week and day time grids. */
export type VisibleHours = { from: number; to: number };

/**
 * An owner of calendar items (a worker, room, team, ...). Domain-agnostic:
 * the consumer maps its own entities onto this shape.
 */
export interface CalendarResource {
  id: string;
  name: string;
  /** Optional short label rendered next to the resource name. */
  badge?: string;
  /** Optional avatar image URL; falls back to an initials circle when absent. */
  avatarUrl?: string;
}

/**
 * A single scheduled item. The core works exclusively with `Date` fields;
 * consumers convert their DTOs (usually ISO strings) via an adapter and keep
 * the original DTO on {@link CalendarItem.payload}.
 *
 * @typeParam T - The original domain DTO carried through untouched.
 */
export interface CalendarItem<T = unknown> {
  id: string;
  title: string;
  /** Start instant. Already converted to a `Date` by the consumer. */
  start: Date;
  /** End instant. Already converted to a `Date` by the consumer. */
  end: Date;
  color: CalendarColor;
  /** Visual treatment hint; defaults to a solid fill. */
  pattern?: EventPattern;
  /** Enables edge drag-resize in the week/day time grids (requires `onItemResize`). */
  resizable?: boolean;
  allDay?: boolean;
  /** Owning resource id; looked up against the provider's `resources`. */
  resourceId?: string;
  /** The untouched domain object this item was derived from. */
  payload: T;
}

/** A single month-grid cell descriptor. */
export interface CalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}
