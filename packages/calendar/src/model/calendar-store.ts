import { createStore } from "zustand/vanilla";

import type { BadgeVariant, CalendarView, VisibleHours, WorkingHours } from "./types";

/** Default Mon–Fri 08:00–17:00, weekend closed. Override via the provider. */
export const DEFAULT_WORKING_HOURS: WorkingHours = {
  0: { from: 0, to: 0 },
  1: { from: 8, to: 17 },
  2: { from: 8, to: 17 },
  3: { from: 8, to: 17 },
  4: { from: 8, to: 17 },
  5: { from: 8, to: 17 },
  6: { from: 0, to: 0 },
};

/** Default visible window for the week/day time grids. */
export const DEFAULT_VISIBLE_HOURS: VisibleHours = { from: 7, to: 18 };

/** Time span the agenda view lists items for. */
export type AgendaScope = "month" | "year";

/** Reactive calendar state plus its setters. */
export interface CalendarStoreState {
  currentView: CalendarView;
  selectedDate: Date;
  /** Agenda view span: one month (default) or the whole year. */
  agendaScope: AgendaScope;
  /** `"all"` or a specific resource id used to filter items. */
  selectedResourceId: string | "all";
  badgeVariant: BadgeVariant;
  workingHours: WorkingHours;
  visibleHours: VisibleHours;
  /** Pixels per hour in the time grids; `"fit"` scales rows to fill the body. */
  hourHeight: number | "fit";

  setCurrentView: (view: CalendarView) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedResourceId: (id: string | "all") => void;
  setBadgeVariant: (variant: BadgeVariant) => void;
  setWorkingHours: (hours: WorkingHours) => void;
  setVisibleHours: (hours: VisibleHours) => void;
}

/** Initial values supplied by the consumer when creating a store. */
export interface CreateCalendarStoreOptions {
  defaultView?: CalendarView;
  /** Agenda view span: one month (default) or the whole year. */
  agendaScope?: AgendaScope;
  defaultDate?: Date;
  defaultResourceId?: string | "all";
  badgeVariant?: BadgeVariant;
  workingHours?: WorkingHours;
  visibleHours?: VisibleHours;
  /** Pixels per hour in the time grids (default 96); `"fit"` fills the body height. */
  hourHeight?: number | "fit";
}

/** A standalone (non-singleton) vanilla store instance. */
export type CalendarStore = ReturnType<typeof createCalendarStore>;

/**
 * Creates an isolated calendar store so multiple calendars can coexist on one page.
 *
 * State is never persisted; the consumer provides initial values through the provider.
 */
export function createCalendarStore(options: CreateCalendarStoreOptions = {}) {
  return createStore<CalendarStoreState>()((set) => ({
    currentView: options.defaultView ?? "month",
    selectedDate: options.defaultDate ?? new Date(),
    agendaScope: options.agendaScope ?? "month",
    selectedResourceId: options.defaultResourceId ?? "all",
    badgeVariant: options.badgeVariant ?? "colored",
    workingHours: options.workingHours ?? DEFAULT_WORKING_HOURS,
    visibleHours: options.visibleHours ?? DEFAULT_VISIBLE_HOURS,
    hourHeight: options.hourHeight ?? 96,

    setCurrentView: (currentView) => set({ currentView }),
    setSelectedDate: (selectedDate) => set({ selectedDate }),
    setSelectedResourceId: (selectedResourceId) => set({ selectedResourceId }),
    setBadgeVariant: (badgeVariant) => set({ badgeVariant }),
    setWorkingHours: (workingHours) => set({ workingHours }),
    setVisibleHours: (visibleHours) => set({ visibleHours }),
  }));
}
