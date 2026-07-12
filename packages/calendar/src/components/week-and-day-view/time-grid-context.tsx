import { createContext, useContext } from "react";

/** Default vertical pixels per hour in the week/day time grids. */
export const DEFAULT_HOUR_PX = 96;

const TimeGridContext = createContext<number>(DEFAULT_HOUR_PX);

/** Provides the resolved pixels-per-hour to nested time-grid components. */
export const TimeGridProvider = TimeGridContext.Provider;

/** The enclosing time grid's pixels-per-hour (default 96 outside a provider). */
export function useHourPx(): number {
  return useContext(TimeGridContext);
}
