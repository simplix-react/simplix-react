/**
 * DateTime Internationalization Utilities
 *
 * Provides locale-aware date/time formatting using the browser's Intl API.
 * - Date FORMAT is determined by locale (country conventions)
 * - Time DISPLAY respects the user's timezone setting
 *
 * Host-agnostic: the consumer supplies `locale` and `timeZone`; see the
 * `DateTimeProvider` (`./react`) for the React binding that injects them.
 */

// Type definitions
export type DateInput = Date | string | number;

export interface FormatDateOptions {
  preset?: "short" | "medium" | "long" | "full";
  custom?: Intl.DateTimeFormatOptions;
}

export interface FormatTimeOptions {
  preset?: "short" | "medium";
  showSeconds?: boolean;
}

export interface FormatDateTimeOptions extends FormatDateOptions {
  timePreset?: "short" | "medium";
  showSeconds?: boolean;
}

// Locale to BCP 47 tag mapping
const LOCALE_TO_BCP47: Record<string, string> = {
  ko: "ko-KR",
  en: "en-US",
  ja: "ja-JP",
  zh: "zh-CN",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-BR",
  ru: "ru-RU",
  ar: "ar-SA",
  hi: "hi-IN",
  th: "th-TH",
  vi: "vi-VN",
  id: "id-ID",
  ms: "ms-MY",
  tr: "tr-TR",
  pl: "pl-PL",
  nl: "nl-NL",
  sv: "sv-SE",
  no: "no-NO",
  da: "da-DK",
  fi: "fi-FI",
};

// Date preset options
// Note: Using explicit options instead of dateStyle to ensure 4-digit year
const DATE_PRESETS: Record<string, Intl.DateTimeFormatOptions> = {
  short: { year: "numeric", month: "2-digit", day: "2-digit" },
  medium: { year: "numeric", month: "short", day: "numeric" },
  long: { year: "numeric", month: "long", day: "numeric" },
  full: { year: "numeric", month: "long", day: "numeric", weekday: "long" },
};

// Time preset options
// Note: Using explicit options instead of timeStyle for compatibility with date options
// hourCycle: 'h23' forces 24-hour format (0-23) regardless of locale
const TIME_PRESETS: Record<string, Intl.DateTimeFormatOptions> = {
  short: { hour: "2-digit", minute: "2-digit", hourCycle: "h23" },
  medium: { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" },
};

// Formatter cache for performance
const formatterCache = new Map<string, Intl.DateTimeFormat>();
const relativeFormatterCache = new Map<string, Intl.RelativeTimeFormat>();

/**
 * Convert short locale code to BCP 47 tag
 */
export function toBCP47Locale(locale: string): string {
  if (!locale) return "en-US";

  // Already a BCP 47 tag (contains hyphen)
  if (locale.includes("-")) return locale;

  // Map to BCP 47
  return LOCALE_TO_BCP47[locale.toLowerCase()] || `${locale}-${locale.toUpperCase()}`;
}

/**
 * Get a validated locale, falling back to 'en-US' if invalid
 */
function getSafeLocale(locale: string | undefined): string {
  if (!locale) return "en-US";

  const bcp47 = toBCP47Locale(locale);

  try {
    // Validate by creating a formatter
    new Intl.DateTimeFormat(bcp47);
    return bcp47;
  } catch {
    return "en-US";
  }
}

/**
 * Get a validated timezone, falling back to browser default if invalid
 */
function getSafeTimeZone(timeZone: string | undefined): string {
  if (!timeZone) {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "UTC";
    }
  }

  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return timeZone;
  } catch {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "UTC";
    }
  }
}

/**
 * Parse date input to Date object
 */
function parseDate(date: DateInput): Date | null {
  if (!date) return null;

  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }

  if (typeof date === "number") {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof date === "string") {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

/**
 * Get or create a cached DateTimeFormat instance
 */
function getFormatter(
  locale: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = JSON.stringify({ locale, timeZone, ...options });

  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.DateTimeFormat(locale, { timeZone, ...options }));
  }

  return formatterCache.get(key)!;
}

/**
 * Get or create a cached RelativeTimeFormat instance
 */
function getRelativeFormatter(locale: string): Intl.RelativeTimeFormat {
  if (!relativeFormatterCache.has(locale)) {
    relativeFormatterCache.set(locale, new Intl.RelativeTimeFormat(locale, { numeric: "auto" }));
  }

  return relativeFormatterCache.get(locale)!;
}

/**
 * Format a date according to locale conventions.
 *
 * @example
 * formatDate(new Date(), "ko", "Asia/Seoul", { preset: "short" }) // "2024. 12. 5."
 */
export function formatDate(
  date: DateInput,
  locale: string,
  timeZone: string,
  options: FormatDateOptions = {},
): string {
  const parsed = parseDate(date);
  if (!parsed) return "";

  const safeLocale = getSafeLocale(locale);
  const safeTimeZone = getSafeTimeZone(timeZone);

  const formatOptions = options.custom || DATE_PRESETS[options.preset || "short"];
  const formatter = getFormatter(safeLocale, safeTimeZone, formatOptions);

  return formatter.format(parsed);
}

/**
 * Format a time according to locale conventions.
 *
 * @example
 * formatTime(new Date(), "ko", "Asia/Seoul", { preset: "short" }) // "14:30"
 */
export function formatTime(
  date: DateInput,
  locale: string,
  timeZone: string,
  options: FormatTimeOptions = {},
): string {
  const parsed = parseDate(date);
  if (!parsed) return "";

  const safeLocale = getSafeLocale(locale);
  const safeTimeZone = getSafeTimeZone(timeZone);

  let formatOptions: Intl.DateTimeFormatOptions = TIME_PRESETS[options.preset || "short"];

  if (options.showSeconds) {
    formatOptions = { ...formatOptions, second: "2-digit" };
  }

  const formatter = getFormatter(safeLocale, safeTimeZone, formatOptions);

  return formatter.format(parsed);
}

/**
 * Format date and time together according to locale conventions.
 *
 * @example
 * formatDateTime(new Date(), "ko", "Asia/Seoul", { preset: "short" }) // "2024. 12. 5. 14:30"
 */
export function formatDateTime(
  date: DateInput,
  locale: string,
  timeZone: string,
  options: FormatDateTimeOptions = {},
): string {
  const parsed = parseDate(date);
  if (!parsed) return "";

  const safeLocale = getSafeLocale(locale);
  const safeTimeZone = getSafeTimeZone(timeZone);

  let formatOptions: Intl.DateTimeFormatOptions;

  if (options.custom) {
    formatOptions = options.custom;
  } else {
    const datePreset = DATE_PRESETS[options.preset || "short"];
    const timePreset = TIME_PRESETS[options.timePreset || "short"];

    formatOptions = { ...datePreset, ...timePreset };

    if (options.showSeconds) {
      formatOptions = { ...formatOptions, second: "2-digit" };
    }
  }

  const formatter = getFormatter(safeLocale, safeTimeZone, formatOptions);

  return formatter.format(parsed);
}

// Relative time units in milliseconds
const RELATIVE_TIME_UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: "week", ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
  { unit: "second", ms: 1000 },
];

/**
 * Format relative time (e.g., "3 minutes ago", "yesterday", "in 2 hours").
 *
 * @example
 * formatRelative(new Date(Date.now() - 3 * 60 * 1000), "ko") // "3분 전"
 */
export function formatRelative(
  date: DateInput,
  locale: string,
  baseDate: Date = new Date(),
): string {
  const parsed = parseDate(date);
  if (!parsed) return "";

  const safeLocale = getSafeLocale(locale);
  const diff = parsed.getTime() - baseDate.getTime();
  const absDiff = Math.abs(diff);

  // Find the appropriate unit
  for (const { unit, ms } of RELATIVE_TIME_UNITS) {
    if (absDiff >= ms || unit === "second") {
      const value = Math.round(diff / ms);
      const formatter = getRelativeFormatter(safeLocale);
      return formatter.format(value, unit);
    }
  }

  return "";
}

/**
 * Clear formatter caches (useful for testing or memory management)
 */
export function clearFormatterCaches(): void {
  formatterCache.clear();
  relativeFormatterCache.clear();
}
