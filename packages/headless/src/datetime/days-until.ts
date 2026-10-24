import { zoneDayOf } from "./zone-time";
import { getAppTimeZone } from "./app-timezone";

/** Milliseconds in a day, used only to divide two midnight-anchored UTC stamps. */
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * How many days from today until a calendar date, counted in the deployment's own zone.
 *
 * @remarks
 * A deadline written as a date is half an answer. "2026-08-14" tells an operator what to quote a
 * customer; how many days that is tells them whether it is today's problem, and working the
 * difference out by hand is arithmetic the screen should have done — once per record, on the day
 * several records need it at once.
 *
 * @remarks
 * Counted in the deployment's zone rather than the reader's, because a calendar date has no
 * instant to convert: which day "today" is decides the answer, and two readers in different zones
 * must not see a contract expire on different days. Displaying the date itself is the other axis
 * and belongs to the reader's zone.
 *
 * @param day the target date as `yyyy-MM-dd`, or null
 * @returns whole days remaining — 0 on the day itself, negative once it has passed — or null when
 *     the date is absent or unreadable
 *
 * @example
 * ```ts
 * daysUntilDay("2026-08-14"); // 8, when the deployment's today is 2026-08-06
 * ```
 */
/**
 * <b>This anchors on the app's zone and takes none, and its neighbours in this module take one.</b>
 * `zoneCalendarDate(zone, …)` and `zoneDayOf(zone, …)` honour whatever zone they are handed; this
 * one reads `getAppTimeZone()` and cannot be told otherwise. A caller holding a workplace's own
 * zone — which this console has, and shows in its status strip — can therefore mix the two in one
 * sentence and get an answer that is right on most days and a day out near midnight, with nothing
 * in a type or a build to say so.
 *
 * <p>Where a call site has a zone of its own, say in a comment that it is the app's, or that the
 * two agree at that site. **A future caller passing a different one is what this note exists for**:
 * the signature offers it no way to be right.
 */
export function daysUntilDay(day: string | null | undefined): number | null {
  if (!day) return null;
  const today = zoneDayOf(getAppTimeZone(), new Date());
  if (!today) return null;
  // Both parsed as UTC midnight, so the division is over whole days and never lands mid-day: a
  // local-time parse would put the two ends in different offsets across a DST boundary and lose
  // or gain an hour, which rounds a deadline to the wrong day exactly twice a year.
  const target = Date.parse(`${day}T00:00:00Z`);
  const from = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(target) || Number.isNaN(from)) return null;
  return Math.round((target - from) / DAY_MS);
}
