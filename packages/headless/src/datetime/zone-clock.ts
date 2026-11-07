import { useEffect, useMemo, useState } from "react";

import { useAppTimeZone } from "./app-timezone";
import { zoneCalendarDate, zoneDayRange, type ZoneInstantRange } from "./zone-bounds";

/** Today in a zone: its `yyyy-MM-dd` day and the half-open instants it spans. */
export interface ZoneToday extends ZoneInstantRange {
  /** The zone's calendar day, as `yyyy-MM-dd`. */
  readonly day: string;
}

/** Longest single wait: a timer that far ahead is re-armed instead of trusted across a sleep. */
const MAX_WAIT_MS = 60 * 60 * 1000;

function todayIn(zone: string): ZoneToday {
  const now = new Date();
  return { ...zoneDayRange(zone, now), day: zoneCalendarDate(zone, now) };
}

/**
 * Today in the app's zone (or the one named), moving on at that zone's midnight.
 *
 * @remarks
 * A count of "today" and the rows it names are one window, so a screen reads the window from here
 * rather than computing it per render. It moves at the zone's own midnight, never the browser's,
 * and on one timer armed for that instant (re-armed at most an hour ahead, so a laptop that slept
 * past midnight still moves on when it wakes). Until then every render gets the same strings, so a
 * query keyed on them is not re-read.
 *
 * @param zone - The IANA zone; defaults to the app's zone.
 * @returns The zone's day and its `[from, to)` instants.
 */
export function useZoneToday(zone?: string): ZoneToday {
  const appZone = useAppTimeZone();
  const at = zone ?? appZone;
  const [today, setToday] = useState(() => todayIn(at));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const arm = () => {
      const next = todayIn(at);
      setToday((current) => (current.day === next.day && current.from === next.from ? current : next));
      const wait = Math.min(Math.max(Date.parse(next.to) - Date.now(), 0) + 1, MAX_WAIT_MS);
      timer = setTimeout(arm, wait);
    };
    arm();
    return () => clearTimeout(timer);
  }, [at]);

  return today;
}

/** Options for {@link useRollingWindow}. */
export interface RollingWindowOptions {
  /**
   * How often the window moves on, in milliseconds. Its end is cut to this step, so the strings
   * change once per step and a query keyed on them is read again once per step. Left out, the
   * window is fixed when the component mounts: a figure and the rows a press on it opens stay one
   * window while the reader works.
   */
  readonly tick?: number;
}

/** The step a window with no tick is cut to, so a remount inside one minute reads the same window. */
const FIXED_STEP_MS = 60 * 1000;

function windowEndingAt(end: number, ms: number): ZoneInstantRange {
  return { from: new Date(end - ms).toISOString(), to: new Date(end).toISOString() };
}

/**
 * The last `ms` milliseconds, as a half-open `[from, to)` instant range.
 *
 * @remarks
 * A rolling window (the last 24 hours, the last 10 minutes) needs no zone, but it needs one
 * decision every screen otherwise makes by hand: whether it moves. With `tick` it moves once per
 * tick, on the tick's boundary; without, it is the window at page open. A query keyed on a moving
 * window changes its key every tick, so give that query `placeholderData: keepPreviousData` to keep
 * the last answer on screen while the next one is read.
 *
 * @param ms - How long the window is.
 * @param options - How often it moves on.
 * @returns The window's `from` and `to`, as UTC RFC 3339 instants.
 */
export function useRollingWindow(ms: number, options: RollingWindowOptions = {}): ZoneInstantRange {
  const step = options.tick ?? FIXED_STEP_MS;
  const [end, setEnd] = useState(() => Math.floor(Date.now() / step) * step);

  useEffect(() => {
    if (options.tick === undefined) return;
    const tick = options.tick;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const arm = () => {
      const now = Date.now();
      setEnd(Math.floor(now / tick) * tick);
      timer = setTimeout(arm, tick - (now % tick));
    };
    arm();
    return () => clearTimeout(timer);
  }, [options.tick]);

  return useMemo(() => windowEndingAt(end, ms), [end, ms]);
}
