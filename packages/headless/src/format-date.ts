/**
 * Locale-aware date formatting and locale utilities.
 *
 * All formatting functions accept an optional BCP 47 locale tag.
 * When omitted, `Intl.DateTimeFormat` falls back to the runtime default.
 */

// ── Locale utilities ──

const LOCALE_TO_BCP47: Record<string, string> = {
  ko: "ko-KR",
  en: "en-US",
  ja: "ja-JP",
  zh: "zh-CN",
};

/** Convert a short locale code to BCP 47 tag. Pass-through if already a tag. */
export function toBcp47(locale: string): string {
  return LOCALE_TO_BCP47[locale] ?? locale;
}

/** Whether the locale uses year-first ordering (East Asian languages). */
export function isYearFirstLocale(locale: string): boolean {
  return ["ko", "ja", "zh", "zh-CN", "zh-TW"].includes(locale);
}

/** Localized short month names — e.g. ["Jan", …] in the given locale. */
export function getMonthNames(locale: string): string[] {
  const bcp47 = toBcp47(locale);
  const formatter = new Intl.DateTimeFormat(bcp47, { month: "short" });
  return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2024, i, 1)));
}

/** Generate a sequential array of years. */
export function generateYears(start: number, end: number, reverse = false): number[] {
  const years = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return reverse ? years.reverse() : years;
}

// ── Formatting functions ──

/**
 * The Gregorian year a `Date` falls in, read in `timeZone` when one is given.
 *
 * Pinned to `en-US` so the comparison is calendar-stable: a display locale with
 * a non-Gregorian calendar (`ja-JP-u-ca-japanese`) numbers its years by era,
 * and two dates in one Gregorian year can carry different era years.
 */
function yearOf(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}

/** Whether a date has to spell its year out — anything outside the current year does. */
function isOutsideCurrentYear(date: Date, timeZone?: string): boolean {
  return yearOf(date, timeZone) !== yearOf(new Date(), timeZone);
}

/** Short date, with or without the year — e.g. "Mar 3" or "Mar 3, 2024", localized. */
function shortDate(date: Date, withYear: boolean, locale?: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(locale, {
    ...(withYear ? { year: "numeric" } : {}),
    month: "short",
    day: "numeric",
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}

/**
 * Short date — e.g. "Mar 3" this year, "Mar 3, 2024" in any other, localized.
 *
 * @remarks
 * The year is dropped only where the reader supplies it themselves. Inside the
 * current year "Mar 3" is unambiguous and the year is noise; outside it the same
 * string names the wrong day and nothing on the screen says so, so the year is
 * written. {@link formatDateRange} carries the rule across both ends of a range.
 *
 * Pass `timeZone` (IANA) to render an absolute `Date` in that zone instead of
 * the browser zone (site-scoped detail/display); omit it for zone-neutral use.
 * The zone decides which year counts as current, so a date near a year boundary
 * is judged in the same zone it is printed in.
 */
export function formatDateShort(date: Date, locale?: string, timeZone?: string): string {
  return shortDate(date, isOutsideCurrentYear(date, timeZone), locale, timeZone);
}

/**
 * Medium date with year — e.g. "Mar 3, 2026". Rendered in the given locale.
 *
 * Pass `timeZone` (IANA) to render an absolute `Date` in that zone instead of
 * the browser zone (site-scoped detail/display); omit it for zone-neutral use.
 */
export function formatDateMedium(date: Date, locale?: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}

/**
 * Format a Date as a zone-neutral calendar date string `yyyy-MM-dd` using the
 * LOCAL calendar fields (never UTC). This is the single source for the
 * date-only wire format shared by {@link asPlainDate}'s `toJSON` and any
 * hand-rolled DTO serialization of a `LocalDate` (`format:date`) field.
 *
 * @remarks
 * Use this instead of `date.toISOString().slice(0, 10)`, which computes the
 * date in UTC and shifts by a day for local-midnight Dates east/west of UTC.
 */
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Medium date + short time — e.g. "Mar 3, 2026, 2:30 PM".
 *
 * Pass `timeZone` (IANA) to render an absolute `Date` in that zone instead of
 * the browser zone (site-scoped detail/display); omit it for zone-neutral use.
 */
export function formatDateTime(date: Date, locale?: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}

/** Locale-aware relative time — e.g. "3 days ago", localized. */
export function formatRelativeTime(date: Date, locale?: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absDiff = Math.abs(diffInSeconds);

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 365 * 24 * 60 * 60],
    ["month", 30 * 24 * 60 * 60],
    ["week", 7 * 24 * 60 * 60],
    ["day", 24 * 60 * 60],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, seconds] of units) {
    if (absDiff >= seconds) {
      return rtf.format(Math.round(diffInSeconds / seconds), unit);
    }
  }
  return rtf.format(0, "second");
}

/**
 * Format a date range as a short string — e.g. "Mar 3 – Mar 27", localized.
 * Returns `null` when both `from` and `to` are undefined.
 *
 * @remarks
 * Both ends carry the year or neither does, and neither only when both ends fall
 * in the current year. Deciding each end on its own would write "Dec 20, 2025 –
 * Jan 5" for a range that crosses new year, where the unmarked end reads as
 * belonging to the year the marked one names.
 */
export function formatDateRange(
  from: Date | undefined,
  to: Date | undefined,
  locale?: string,
  timeZone?: string,
): string | null {
  const withYear =
    (from ? isOutsideCurrentYear(from, timeZone) : false) ||
    (to ? isOutsideCurrentYear(to, timeZone) : false);
  if (from && to)
    return `${shortDate(from, withYear, locale, timeZone)} \u2013 ${shortDate(to, withYear, locale, timeZone)}`;
  if (from) return `${shortDate(from, withYear, locale, timeZone)} \u2013 ...`;
  if (to) return `... \u2013 ${shortDate(to, withYear, locale, timeZone)}`;
  return null;
}
