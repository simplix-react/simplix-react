import { decodeInstant, serializeInstant } from "../rfc3339-date";
import type { TimeValue } from "../time-select";

import { zoneCalendarDate } from "./zone-bounds";

/**
 * Wall-clock bridge for a site-scoped instant whose calendar day is fixed
 * elsewhere on the form — the operator picks the day once and each end's time
 * separately, so the two ends can never land on different dates.
 *
 * Zone math stays inside these helpers: the carrier returned by `decodeInstant`
 * holds the zone's wall clock in its LOCAL fields, and `serializeInstant`
 * re-anchors it to the zone. Never read a carrier's fields outside this module.
 */

/** The `yyyy-MM-dd` calendar date of an instant IN `zone`, or null when unset. */
export function zoneDayOf(
  zone: string,
  instant: string | Date | null | undefined,
): string | null {
  const at = decodeInstant(instant);
  return at ? zoneCalendarDate(zone, at) : null;
}

/**
 * The zone-local time of day of an instant, as the value a
 * `FormFields.TimeField` reads. Null when the instant is unset or malformed.
 */
export function zoneTimeOf(
  zone: string,
  instant: string | Date | null | undefined,
): TimeValue | null {
  const carrier = decodeInstant(instant, zone);
  if (!carrier) return null;
  return { hours: carrier.getHours(), minutes: carrier.getMinutes() };
}

/**
 * The zone-local `HH:mm` of an instant, or null when it is unset or malformed.
 *
 * <p><b>For a row that already says which day it is on.</b> A change history bands its rows by
 * calendar day and then says the time on each — repeating the date twenty times is the noise the
 * bands exist to remove. `InstantText` draws a whole datetime or a whole date and nothing between,
 * so the clock is assembled here rather than at the screen: the browser's own zone is one
 * `getHours()` away at every call site, and a history that silently reads eight hours off is
 * indistinguishable from one that is right.
 *
 * @param zone the IANA zone the reader is reading in — the site's, never the browser's
 * @param instant the absolute instant
 * @returns `HH:mm` in that zone, or null
 */
export function zoneClockOf(
  zone: string,
  instant: string | Date | null | undefined,
): string | null {
  const time = zoneTimeOf(zone, instant);
  if (!time) return null;
  return `${String(time.hours).padStart(2, "0")}:${String(time.minutes).padStart(2, "0")}`;
}

/**
 * The instant at `time` on the zone-local calendar day `day` (`yyyy-MM-dd`),
 * serialized RFC 3339 with the zone's offset. Null when either input is unset.
 *
 * This is how a single-day window is assembled: the operator picks the day once
 * and each end's time separately, so no pair of ends can straddle midnight.
 */
export function zoneInstantAt(
  zone: string,
  day: string | null | undefined,
  time: TimeValue | null | undefined,
): string | null {
  if (!day || !time) return null;
  const [year, month, date] = day.split("-").map(Number);
  if (!year || !month || !date) return null;
  // Anchor on the zone's noon so the carrier lands on the intended day under
  // any offset, then overwrite the wall clock with the picked time.
  const carrier = decodeInstant(new Date(Date.UTC(year, month - 1, date, 12)), zone);
  if (!carrier) return null;
  carrier.setFullYear(year, month - 1, date);
  carrier.setHours(time.hours, time.minutes, 0, 0);
  return serializeInstant(carrier, zone) ?? null;
}

/**
 * `time` moved forward by `hours`, clamped to the last minute of the day — a
 * default end never rolls the window onto the next date.
 */
export function timePlusHours(time: TimeValue, hours: number): TimeValue {
  const total = time.hours * 60 + time.minutes + hours * 60;
  if (total >= 24 * 60 - 1) return { hours: 23, minutes: 59 };
  return { hours: Math.floor(total / 60), minutes: total % 60 };
}

/** True when `a` is at or after `b` on the same day. */
export function timeAtOrAfter(a: TimeValue, b: TimeValue): boolean {
  return a.hours * 60 + a.minutes >= b.hours * 60 + b.minutes;
}

/**
 * The instant at `time` on the SAME zone-local calendar day as `anchor`,
 * serialized RFC 3339 with the zone's offset. Null when either input is unset.
 */
export function zoneInstantOnDayOf(
  zone: string,
  anchor: string | Date | null | undefined,
  time: TimeValue | null | undefined,
): string | null {
  if (!time) return null;
  const carrier = decodeInstant(anchor, zone);
  if (!carrier) return null;
  carrier.setHours(time.hours, time.minutes, 0, 0);
  return serializeInstant(carrier, zone) ?? null;
}

/** True when both instants fall on the same calendar day in `zone`. */
export function isSameZoneDay(
  zone: string,
  a: string | Date | null | undefined,
  b: string | Date | null | undefined,
): boolean {
  const dayA = zoneDayOf(zone, a);
  const dayB = zoneDayOf(zone, b);
  return dayA != null && dayA === dayB;
}

/**
 * An instant as the date and the time of day, in `zone`, as one string.
 *
 * @remarks
 * For a value that shares its line with something else — a name, a verb — where `InstantText` would
 * draw a second element into a row that holds one. A row with its own line uses that component
 * instead.
 *
 * <p>The locale is the reader's rather than a fixed one: the same screen renders this beside
 * translated labels, and a date that stays Korean while everything around it turns English is the
 * one value on the row nobody can read.
 *
 * @param zone the IANA zone to read the instant in — the workplace's, never the browser's
 * @param instant the absolute instant
 * @param locale the reader's locale
 * @returns the date and time in that zone, or null when the instant is unset or malformed
 */
export function zoneDateTimeText(
  zone: string,
  instant: string | Date | null | undefined,
  locale: string,
): string | null {
  const at = decodeInstant(instant);
  if (!at) return null;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: zone,
  }).format(at);
}
