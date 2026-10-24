import { decodeInstant, serializeInstant } from "../rfc3339-date";

/**
 * Zone-local calendar-window bounds as offset-bearing instants — the ONE shared
 * source for "today / this week / this month in an explicit display zone".
 * Replaces browser-midnight (`setHours(0,0,0,0)` + `toISOString()`) and
 * UTC-midnight (`${d}T00:00:00Z`) boundary building, both of which select a
 * different day than the display zone's for operators in other zones.
 *
 * All ranges are half-open `[from, to)`. Relative windows anchored to "now"
 * (last hour / last 24 h) do NOT need these helpers — any offset denotes the
 * same instant, so `toISOString()` on `new Date()` is fine there.
 */

/** Half-open instant range, serialized as RFC 3339 with the zone's offset. */
export interface ZoneInstantRange {
  from: string;
  to: string;
}

function carrierOf(zone: string, at: Date): Date {
  // decodeInstant projects the instant into the zone (floating carrier whose
  // LOCAL fields are the zone's wall clock); carrier math below stays in that
  // wall-clock space and serializeInstant re-anchors it to the zone.
  const carrier = decodeInstant(at, zone);
  if (!carrier) throw new Error(`zone-bounds: cannot project into zone '${zone}'`);
  return carrier;
}

function range(startCarrier: Date, endCarrier: Date, zone: string): ZoneInstantRange {
  const from = serializeInstant(startCarrier, zone);
  const to = serializeInstant(endCarrier, zone);
  if (!from || !to) throw new Error(`zone-bounds: cannot serialize bounds for zone '${zone}'`);
  return { from, to };
}

/** `[from, to)` instants of the zone-local day containing `at` (default: now). */
export function zoneDayRange(zone: string, at: Date = new Date()): ZoneInstantRange {
  const start = carrierOf(zone, at);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return range(start, end, zone);
}

/**
 * `[from, to)` instants of the zone-local week containing `at` (default: now).
 * Weeks start on Monday, matching the statistics API's week buckets.
 */
export function zoneWeekRange(zone: string, at: Date = new Date()): ZoneInstantRange {
  const start = carrierOf(zone, at);
  start.setHours(0, 0, 0, 0);
  // getDay(): 0 = Sunday … 6 = Saturday → distance back to Monday.
  const back = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - back);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return range(start, end, zone);
}

/** `[from, to)` instants of the zone-local month containing `at` (default: now). */
export function zoneMonthRange(zone: string, at: Date = new Date()): ZoneInstantRange {
  const start = carrierOf(zone, at);
  start.setHours(0, 0, 0, 0);
  start.setDate(1);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return range(start, end, zone);
}

/**
 * `[from, to)` instants of the last `days` zone-local days ending after today
 * (i.e. from the start of day `today − days + 1` to the end of today).
 */
export function zoneLastDaysRange(zone: string, days: number, at: Date = new Date()): ZoneInstantRange {
  const end = carrierOf(zone, at);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 1);
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  return range(start, end, zone);
}

// ── Picked-calendar-day variants ──
//
// For USER-PICKED dates (a date picker's local-midnight Date), the picked LOCAL
// calendar fields ARE the intended calendar position in the display zone — do
// NOT project the pick as an instant (zoneDayRange(zone, picked) would shift
// the day when the browser zone differs from the display zone). These variants
// read the picked Date's local fields directly.

/** `[from, to)` instants of the zone-local day at `picked`'s LOCAL calendar position. */
export function zonePickedDayRange(zone: string, picked: Date): ZoneInstantRange {
  const start = new Date(picked.getFullYear(), picked.getMonth(), picked.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return range(start, end, zone);
}

/**
 * `[from, to)` instants of the zone-local week (Monday start) containing
 * `picked`'s LOCAL calendar position.
 */
export function zonePickedWeekRange(zone: string, picked: Date): ZoneInstantRange {
  const start = new Date(picked.getFullYear(), picked.getMonth(), picked.getDate());
  const back = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - back);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return range(start, end, zone);
}

/** `[from, to)` instants of the zone-local month at `picked`'s LOCAL calendar position. */
export function zonePickedMonthRange(zone: string, picked: Date): ZoneInstantRange {
  const start = new Date(picked.getFullYear(), picked.getMonth(), 1);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return range(start, end, zone);
}

/**
 * The `yyyy-MM-dd` calendar date of `at` (default: now) IN `zone` — the zone's
 * day, never the browser's. Use for "today" defaults, past/future validation,
 * and any bare-date comparison anchored to a display zone.
 */
export function zoneCalendarDate(zone: string, at: Date = new Date()): string {
  // en-CA formats as ISO `yyyy-MM-dd`; the timeZone option resolves the zone-local day.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

/**
 * The instant a zone-local calendar day begins, as an offset-bearing RFC 3339 string.
 *
 * @remarks
 * A date picker hands back a calendar day; a field typed as an instant needs a moment. Anchoring
 * that day to midnight in the display zone is the only conversion that keeps the date the operator
 * picked — browser midnight and UTC midnight both land on the neighbouring day for somebody in
 * another zone, and the record then reads back a day out.
 *
 * @param zone IANA zone the day was picked in
 * @param day the picked calendar day, as a Date or an ISO string
 * @returns the instant that day begins, or undefined when there is no day
 */
export function zoneDayStartInstant(zone: string, day: Date | string | null | undefined): string | undefined {
  if (!day) return undefined;
  const at = day instanceof Date ? day : new Date(day);
  if (Number.isNaN(at.getTime())) return undefined;
  const start = carrierOf(zone, at);
  start.setHours(0, 0, 0, 0);
  return serializeInstant(start, zone) ?? undefined;
}

/** Two digits, so a calendar day reads back as the `yyyy-MM-dd` the server keeps. */
const pad = (value: number): string => String(value).padStart(2, "0");

/**
 * The zone's calendar day `days` away from `at`, as `yyyy-MM-dd`.
 *
 * @remarks
 * The shift happens in the zone's own wall clock, which is the half that gets written by hand and
 * got wrong: taking today's day out of the zone and then stepping it with a browser-local `Date`
 * lands on the browser's calendar, and the two disagree for the hours the zones do. Anchored at
 * noon so a daylight-saving step cannot roll the date under the arithmetic.
 *
 * @param zone the IANA zone the day is reckoned in — the workplace's, never the browser's
 * @param days how many days on, negative for days back
 * @param at the instant to count from, defaulting to now
 * @returns that day as `yyyy-MM-dd`
 */
export function zoneDayShifted(zone: string, days: number, at: Date = new Date()): string {
  const carrier = carrierOf(zone, at);
  carrier.setHours(12, 0, 0, 0);
  carrier.setDate(carrier.getDate() + days);
  return `${carrier.getFullYear()}-${pad(carrier.getMonth() + 1)}-${pad(carrier.getDate())}`;
}

/** How a calendar day is written out — in a sentence, or as the date itself. */
export type CalendarDayStyle = "long" | "iso";

/**
 * A calendar day as a person says it, with its weekday.
 *
 * @remarks
 * Read from the string's own components and never through an instant: a calendar day has no time
 * and no zone, and parsing one into a `Date` to format it moves it a day either way for half the
 * world. Which is why this takes the day rather than the moment — a caller holding an instant asks
 * {@link zoneCalendarDate} for its day first, and the zone is named once, there.
 *
 * <p>The locale composes `long` itself, including where the weekday sits and whether it is bracketed
 * — 「8월 27일 (목)」 against `Thu, August 27`. Only `iso` is assembled here, because the date half
 * of it is the input unchanged.
 *
 * @param day the calendar day, as `yyyy-MM-dd`
 * @param locale the reader's locale
 * @param style `long` for a day named inside a sentence, `iso` for the date itself
 * @returns the day and its weekday, or the empty string when the day is malformed
 */
export function calendarDayLabel(day: string, locale: string, style: CalendarDayStyle = "long"): string {
  const [year, month, date] = day.split("-").map(Number);
  if (!year || !month || !date) return "";
  // Local midnight of those components, read back in the same local zone — the one construction
  // that returns the components it was given.
  const at = new Date(year, month - 1, date);
  if (style === "iso") {
    return `${day} (${new Intl.DateTimeFormat(locale, { weekday: "short" }).format(at)})`;
  }
  return new Intl.DateTimeFormat(locale, { month: "long", day: "numeric", weekday: "short" }).format(at);
}

/**
 * The calendar day a date picker answered with, as `yyyy-MM-dd`.
 *
 * @remarks
 * From the `Date`'s own fields, because a picker builds local midnight of the day the operator
 * pressed — so the day IS those fields, and reading it in any other zone moves it. This is the one
 * place a display zone is the wrong answer: {@link zoneCalendarDate} here would hand back
 * yesterday for an operator whose browser sits east of the workplace, and the record would keep a
 * day nobody picked.
 *
 * <p>For a field the server types as an instant rather than a calendar day, the conversion is
 * {@link zoneDayStartInstant} instead.
 *
 * @param value what the picker answered with
 * @returns that day as `yyyy-MM-dd`, or undefined where nothing was picked
 */
export function pickedCalendarDay(value: Date | null | undefined): string | undefined {
  if (!value || Number.isNaN(value.getTime())) return undefined;
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}
