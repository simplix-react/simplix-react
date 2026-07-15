import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { useStore } from "zustand";

import { createCalendarStore } from "../model/calendar-store";
import { useCalendarTranslation } from "../lib/use-calendar-translation";
import type { CalendarStore, CalendarStoreState, CreateCalendarStoreOptions } from "../model/calendar-store";
import type { CalendarItem, CalendarResource, CalendarView, DayHighlight, HeatmapCell, TimeBand } from "../model/types";
import { getViewDateRange } from "../helpers";

/** Visible range emitted through {@link CalendarCallbacks.onRangeChange}. */
export interface CalendarRange {
  start: Date;
  end: Date;
  view: CalendarView;
}

/** Consumer-supplied interaction callbacks. All optional. */
export interface CalendarCallbacks {
  /** Fired when an item is activated (click/keyboard). */
  onItemClick?: (item: CalendarItem) => void;
  /** Fired when an empty cell/time slot is activated; receives the slot instant. */
  onCellClick?: (date: Date) => void;
  /** Fired on a drag-drop move; receives the moved item and its new bounds. */
  onItemMove?: (item: CalendarItem, start: Date, end: Date) => void;
  /** Fired when a resizable item's edge is drag-resized in the week/day grids. */
  onItemResize?: (item: CalendarItem, start: Date, end: Date) => void;
  /** Fired whenever view/date navigation changes the visible range. */
  onRangeChange?: (range: CalendarRange) => void;
  /**
   * Fired when a resource label is activated (timeline column header or gantt
   * row label). Gantt rows also pass the row's date.
   */
  onResourceClick?: (resource: CalendarResource, date?: Date) => void;
}

/** Data injected into the timeline and heatmap views. */
export interface CalendarPlugins {
  /** Full-width background bands drawn on the resource-timeline axis. */
  timeBands?: TimeBand[];
  /** Aggregate date×hour×count buckets for the heatmap month view. */
  heatmap?: HeatmapCell[];
  /** Relative scale denominator; when absent, the visible month's max count is used. */
  heatmapMax?: number;
  /** Generic per-day emphasis applied across month/day/week/timeline (holiday mechanism). */
  dayHighlights?: DayHighlight[];
  /** Render extra summary badges inside a heatmap day cell. */
  renderDayBadge?: (date: Date) => ReactNode;
  /**
   * Replaces the month-view day-cell item badges with consumer-rendered content
   * (e.g. per-day aggregate chips). Receives the cell date and the items that
   * overlap it; the day number and highlight label still render above.
   */
  renderDayContent?: (date: Date, items: CalendarItem[]) => ReactNode;
  /**
   * Shows the item-count badge next to the header title. Defaults to true;
   * consumers whose data is not item-based (aggregate views) turn it off.
   */
  showItemCountBadge?: boolean;
  /**
   * Appends metadata (worked totals, badges) after the resource name on a
   * gantt-view row. Receives the row's resource and date.
   */
  renderGanttRowExtra?: (resource: CalendarResource, date: Date) => ReactNode;
  /** Render an extra per-day summary block under the week-view day header. */
  renderWeekDayHeader?: (date: Date) => ReactNode;
  /** Render an action overlay pinned to a time-grid item's bottom-right corner. */
  renderItemOverlay?: (item: CalendarItem) => ReactNode;
  /**
   * Replaces the built-in empty state of the gantt and resource-timeline views.
   * Consumers whose rows only exist for timed records use this to explain what
   * a rowless day means (e.g. "absences appear in the side panel").
   */
  timelineEmptyState?: ReactNode;
}

/** Props for {@link CalendarProvider}. */
export interface CalendarProviderProps extends CreateCalendarStoreOptions, CalendarCallbacks, CalendarPlugins {
  /** Items to render. Consumer converts DTOs to the {@link CalendarItem} shape. */
  items: CalendarItem[];
  /** Resource directory used to resolve `item.resourceId`. */
  resources?: CalendarResource[];
  /** Enable react-dnd drag-drop of items across cells/time slots. */
  dndEnabled?: boolean;
  children: React.ReactNode;
}

interface CalendarDataContextValue extends CalendarCallbacks, CalendarPlugins {
  items: CalendarItem[];
  resources: CalendarResource[];
  resourceById: Map<string, CalendarResource>;
  dndEnabled: boolean;
}

const CalendarStoreContext = createContext<CalendarStore | null>(null);
const CalendarDataContext = createContext<CalendarDataContextValue | null>(null);

function RangeChangeNotifier() {
  const { onRangeChange } = useCalendarData();
  const view = useCalendarSelector((s) => s.currentView);
  const { effectiveView } = useEffectiveRangeView();
  const date = useCalendarSelector((s) => s.selectedDate);
  const { locale } = useCalendarTranslation();

  useEffect(() => {
    if (!onRangeChange) return;
    const { start, end } = getViewDateRange(effectiveView, date, locale);
    onRangeChange({ start, end, view });
  }, [onRangeChange, view, effectiveView, date, locale]);

  return null;
}

/**
 * Owns one isolated calendar store and the item/resource/callback data.
 *
 * Multiple providers can be mounted on the same page without sharing state.
 */
export function CalendarProvider({
  items,
  resources = [],
  dndEnabled = false,
  onItemClick,
  onCellClick,
  onItemMove,
  onItemResize,
  onRangeChange,
  onResourceClick,
  timeBands,
  heatmap,
  heatmapMax,
  dayHighlights,
  renderDayBadge,
  renderDayContent,
  renderWeekDayHeader,
  renderItemOverlay,
  renderGanttRowExtra,
  showItemCountBadge = true,
  timelineEmptyState,
  children,
  ...storeOptions
}: CalendarProviderProps) {
  const storeRef = useRef<CalendarStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createCalendarStore(storeOptions);
  }
  const store = storeRef.current;

  const dataValue = useMemo<CalendarDataContextValue>(
    () => ({
      items,
      resources,
      resourceById: new Map(resources.map((resource) => [resource.id, resource])),
      dndEnabled,
      onItemClick,
      onCellClick,
      onItemMove,
      onItemResize,
      onRangeChange,
      onResourceClick,
      timeBands,
      heatmap,
      heatmapMax,
      dayHighlights,
      renderDayBadge,
      renderDayContent,
      renderWeekDayHeader,
      renderItemOverlay,
      renderGanttRowExtra,
      showItemCountBadge,
      timelineEmptyState,
    }),
    [
      items,
      resources,
      dndEnabled,
      onItemClick,
      onCellClick,
      onItemMove,
      onItemResize,
      onRangeChange,
      onResourceClick,
      timeBands,
      heatmap,
      heatmapMax,
      dayHighlights,
      renderDayBadge,
      renderDayContent,
      renderWeekDayHeader,
      renderItemOverlay,
      renderGanttRowExtra,
      showItemCountBadge,
      timelineEmptyState,
    ]
  );

  return (
    <CalendarStoreContext.Provider value={store}>
      <CalendarDataContext.Provider value={dataValue}>
        <RangeChangeNotifier />
        {children}
      </CalendarDataContext.Provider>
    </CalendarStoreContext.Provider>
  );
}

/** The raw store API for the enclosing provider. Throws outside a provider. */
export function useCalendarStoreApi(): CalendarStore {
  const store = useContext(CalendarStoreContext);
  if (!store) throw new Error("Calendar hooks must be used within a CalendarProvider.");
  return store;
}

/** Subscribe to a slice of calendar store state. */
export function useCalendarSelector<T>(selector: (state: CalendarStoreState) => T): T {
  const store = useCalendarStoreApi();
  return useStore(store, selector);
}

/** Access items, resources, and consumer callbacks. Throws outside a provider. */
export function useCalendarData(): CalendarDataContextValue {
  const value = useContext(CalendarDataContext);
  if (!value) throw new Error("useCalendarData must be used within a CalendarProvider.");
  return value;
}

/** View state and its setter. */
export function useCalendarView() {
  const currentView = useCalendarSelector((s) => s.currentView);
  const setCurrentView = useCalendarSelector((s) => s.setCurrentView);
  return { currentView, setCurrentView };
}

/**
 * The view used for date windows and navigation. Agenda in year scope
 * navigates and filters like the year view.
 */
export function useEffectiveRangeView() {
  const currentView = useCalendarSelector((s) => s.currentView);
  const agendaScope = useCalendarSelector((s) => s.agendaScope);
  const effectiveView = currentView === "agenda" && agendaScope === "year" ? "year" : currentView;
  return { effectiveView, agendaScope };
}

/** Selected date and its setter. */
export function useCalendarDate() {
  const selectedDate = useCalendarSelector((s) => s.selectedDate);
  const setSelectedDate = useCalendarSelector((s) => s.setSelectedDate);
  return { selectedDate, setSelectedDate };
}

/** Badge/working-hours/visible-hours preferences and setters. */
export function useCalendarPreferences() {
  const badgeVariant = useCalendarSelector((s) => s.badgeVariant);
  const setBadgeVariant = useCalendarSelector((s) => s.setBadgeVariant);
  const workingHours = useCalendarSelector((s) => s.workingHours);
  const setWorkingHours = useCalendarSelector((s) => s.setWorkingHours);
  const visibleHours = useCalendarSelector((s) => s.visibleHours);
  const setVisibleHours = useCalendarSelector((s) => s.setVisibleHours);
  return { badgeVariant, setBadgeVariant, workingHours, setWorkingHours, visibleHours, setVisibleHours };
}

/** Resource filter state plus the resource directory. */
export function useCalendarResourceFilter() {
  const selectedResourceId = useCalendarSelector((s) => s.selectedResourceId);
  const setSelectedResourceId = useCalendarSelector((s) => s.setSelectedResourceId);
  const { resources } = useCalendarData();
  return { selectedResourceId, setSelectedResourceId, resources };
}
