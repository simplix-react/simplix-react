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

/** Localized short month names — e.g. ["Jan", …] or ["1월", …]. */
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

/** Short date without year — e.g. "Mar 3" / "3월 3일". */
export function formatDateShort(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(date);
}

/** Medium date with year — e.g. "Mar 3, 2026" / "2026년 3월 3일". */
export function formatDateMedium(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

/** Medium date + short time — e.g. "Mar 3, 2026, 2:30 PM". */
export function formatDateTime(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Locale-aware relative time — e.g. "3 days ago" / "3일 전". */
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
 * Format a date range as a short string — e.g. "Mar 3 – Mar 27" / "3월 3일 – 3월 27일".
 * Returns `null` when both `from` and `to` are undefined.
 */
export function formatDateRange(
  from: Date | undefined,
  to: Date | undefined,
  locale?: string,
): string | null {
  if (from && to) return `${formatDateShort(from, locale)} \u2013 ${formatDateShort(to, locale)}`;
  if (from) return `${formatDateShort(from, locale)} \u2013 ...`;
  if (to) return `... \u2013 ${formatDateShort(to, locale)}`;
  return null;
}
