// Register calendar translations with the framework i18n as a side effect.
import "./locales";

// ---- Provider, hooks, and interaction contracts ----
export {
  CalendarProvider,
  useCalendarData,
  useCalendarView,
  useCalendarDate,
  useCalendarPreferences,
  useCalendarResourceFilter,
  useCalendarSelector,
  useCalendarStoreApi,
} from "./context/calendar-context";
export type { CalendarCallbacks, CalendarPlugins, CalendarProviderProps, CalendarRange } from "./context/calendar-context";
export { CalendarApiBridge } from "./context/calendar-api-bridge";
export type { CalendarApi, CalendarApiBridgeProps } from "./context/calendar-api-bridge";

// ---- Composition surfaces ----
export { CalendarHeader } from "./components/header/calendar-header";
export type { CalendarHeaderProps } from "./components/header/calendar-header";
export { CalendarBody } from "./components/calendar-body";
export { CalendarShell } from "./components/calendar-shell";
export type { CalendarShellProps } from "./components/calendar-shell";
export { CalendarColorLegend } from "./components/calendar-color-legend";
export type { CalendarColorLegendProps, CalendarLegendItem } from "./components/calendar-color-legend";

// ---- View components (compose your own shell if needed) ----
export { CalendarMonthView } from "./components/month-view/calendar-month-view";
export { CalendarWeekView } from "./components/week-and-day-view/calendar-week-view";
export { CalendarDayView } from "./components/week-and-day-view/calendar-day-view";
export { CalendarYearView } from "./components/year-view/calendar-year-view";
export { CalendarAgendaView } from "./components/agenda-view/calendar-agenda-view";
export { ResourceTimelineView } from "./components/resource-timeline/resource-timeline-view";
export { HeatmapMonthView } from "./components/heatmap-view/heatmap-month-view";
export { ResourceAvatar } from "./components/resource-avatar";
export { DayHighlightBadge } from "./components/day-highlight-badge";

// ---- Store factory ----
export { createCalendarStore, DEFAULT_WORKING_HOURS, DEFAULT_VISIBLE_HOURS } from "./model/calendar-store";
export type { AgendaScope, CalendarStore, CalendarStoreState, CreateCalendarStoreOptions } from "./model/calendar-store";

// ---- Model types ----
export type {
  BadgeVariant,
  CalendarCell,
  CalendarColor,
  CalendarItem,
  CalendarResource,
  CalendarView,
  DayHighlight,
  EventPattern,
  HeatmapCell,
  TimeBand,
  VisibleHours,
  WorkingHours,
} from "./model/types";

// ---- Date helpers ----
export { datePart, toDateString, getViewDateRange, navigateDate, patternClass } from "./helpers";
export { dotBgClass, timelineBarClass } from "./lib/item-colors";

// ---- i18n ----
export { PACKAGE_NAMESPACE } from "./locales";
