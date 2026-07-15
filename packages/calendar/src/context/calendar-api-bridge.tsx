import { useEffect } from "react";
import type { MutableRefObject } from "react";

import { useCalendarDate, useCalendarView } from "./calendar-context";
import type { CalendarView } from "../model/types";

/** Imperative calendar control exposed through {@link CalendarApiBridge}. */
export interface CalendarApi {
  /** Switch the active view. */
  setView: (view: CalendarView) => void;
  /** Move the selected date without changing the view. */
  setDate: (date: Date) => void;
  /** Navigate to a date, optionally switching the view (drill-down). */
  goTo: (date: Date, view?: CalendarView) => void;
}

/** Props for {@link CalendarApiBridge}. */
export interface CalendarApiBridgeProps {
  /** Receives the {@link CalendarApi} while the bridge is mounted; reset to null on unmount. */
  apiRef: MutableRefObject<CalendarApi | null>;
}

/**
 * Bridges the calendar store (owned by the enclosing provider) up to the
 * widget through a ref, so handlers living outside the provider can drive
 * navigation — e.g. a month-cell click drilling down into that day's view.
 */
export function CalendarApiBridge({ apiRef }: CalendarApiBridgeProps) {
  const { setCurrentView } = useCalendarView();
  const { setSelectedDate } = useCalendarDate();

  useEffect(() => {
    apiRef.current = {
      setView: setCurrentView,
      setDate: setSelectedDate,
      goTo: (date, view) => {
        setSelectedDate(date);
        if (view) setCurrentView(view);
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, setCurrentView, setSelectedDate]);

  return null;
}
