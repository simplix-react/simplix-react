/**
 * Represents a BCP 47 locale code string (e.g., `"en"`, `"ko"`, `"ja"`).
 */
export type LocaleCode = string;

/**
 * Represents key-value pairs for translation string interpolation.
 *
 * @example
 * ```ts
 * const values: TranslationValues = { name: "Alice", count: 3, active: true };
 * adapter.t("greeting", values); // "Hello, Alice!"
 * ```
 */
export type TranslationValues = Record<string, string | number | boolean>;

/**
 * Provides constant values for date/time formatting styles compatible with the `Intl.DateTimeFormat` API.
 *
 * @example
 * ```ts
 * import { DATE_TIME_STYLES } from "@simplix-react/i18n";
 *
 * adapter.formatDate(new Date(), { dateStyle: DATE_TIME_STYLES.LONG });
 * ```
 */
export const DATE_TIME_STYLES = {
  FULL: "full",
  LONG: "long",
  MEDIUM: "medium",
  SHORT: "short",
} as const;

/**
 * Represents a date/time formatting style derived from {@link DATE_TIME_STYLES}.
 */
export type DateTimeStyle =
  (typeof DATE_TIME_STYLES)[keyof typeof DATE_TIME_STYLES];

/**
 * Provides constant values for number formatting styles compatible with the `Intl.NumberFormat` API.
 *
 * @example
 * ```ts
 * import { NUMBER_FORMAT_STYLES } from "@simplix-react/i18n";
 *
 * adapter.formatNumber(1234.5, { style: NUMBER_FORMAT_STYLES.CURRENCY, currency: "USD" });
 * ```
 */
export const NUMBER_FORMAT_STYLES = {
  DECIMAL: "decimal",
  CURRENCY: "currency",
  PERCENT: "percent",
  UNIT: "unit",
} as const;

/**
 * Represents a number formatting style derived from {@link NUMBER_FORMAT_STYLES}.
 */
export type NumberFormatStyle =
  (typeof NUMBER_FORMAT_STYLES)[keyof typeof NUMBER_FORMAT_STYLES];

/**
 * Provides constant values for text direction (`"ltr"` or `"rtl"`).
 */
export const TEXT_DIRECTIONS = {
  LTR: "ltr",
  RTL: "rtl",
} as const;

/**
 * Represents a text direction value derived from {@link TEXT_DIRECTIONS}.
 */
export type TextDirection =
  (typeof TEXT_DIRECTIONS)[keyof typeof TEXT_DIRECTIONS];

/**
 * Defines plural form strings following the CLDR plural rules.
 *
 * @see {@link https://cldr.unicode.org/index/cldr-spec/plural-rules | CLDR Plural Rules}
 */
export interface PluralForms {
  zero?: string;
  one: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

/**
 * Configures date/time formatting options passed to `Intl.DateTimeFormat`.
 */
export interface DateTimeFormatOptions {
  /** The date formatting style. */
  dateStyle?: DateTimeStyle;
  /** The time formatting style. */
  timeStyle?: DateTimeStyle;
  /** Whether to use 12-hour time format. */
  hour12?: boolean;
}

/**
 * Configures number formatting options passed to `Intl.NumberFormat`.
 */
export interface NumberFormatOptions {
  /** The number formatting style. */
  style?: NumberFormatStyle;
  /** ISO 4217 currency code (required when `style` is `"currency"`). */
  currency?: string;
  /** Unit identifier (required when `style` is `"unit"`). */
  unit?: string;
  /** Minimum number of fraction digits to display. */
  minimumFractionDigits?: number;
  /** Maximum number of fraction digits to display. */
  maximumFractionDigits?: number;
}

/**
 * Describes metadata for a single locale including display names, text direction, and default formats.
 */
export interface LocaleInfo {
  /** BCP 47 locale code. */
  code: LocaleCode;
  /** Native name of the locale (e.g., "한국어"). */
  name: string;
  /** English name of the locale (e.g., "Korean"). */
  englishName: string;
  /** Text direction for the locale. */
  direction: TextDirection;
  /** Default date format pattern. */
  dateFormat: string;
  /** Default time format pattern. */
  timeFormat: string;
  /** Default ISO 4217 currency code. */
  currency: string;
}

/**
 * Describes the configuration for a single supported locale.
 *
 * @example
 * ```ts
 * import type { LocaleConfig } from "@simplix-react/i18n";
 *
 * const korean: LocaleConfig = {
 *   code: "ko",
 *   name: "한국어",
 *   englishName: "Korean",
 *   direction: "ltr",
 *   currency: "KRW",
 * };
 * ```
 */
export interface LocaleConfig {
  /** BCP 47 locale code. */
  code: LocaleCode;
  /** Native display name. */
  name: string;
  /** English display name. */
  englishName: string;
  /** Text direction (defaults to `"ltr"`). */
  direction?: "ltr" | "rtl";
  /** Default date format pattern. */
  dateFormat?: string;
  /** Default time format pattern. */
  timeFormat?: string;
  /** Default ISO 4217 currency code. */
  currency?: string;
}

/**
 * Represents a translation namespace identifier used to scope translation keys.
 */
export type TranslationNamespace = string;

/**
 * Provides constant values representing translation resource loading states.
 */
export const TRANSLATION_LOAD_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  LOADED: "loaded",
  ERROR: "error",
} as const;

/**
 * Represents a translation loading state derived from {@link TRANSLATION_LOAD_STATES}.
 */
export type TranslationLoadState =
  (typeof TRANSLATION_LOAD_STATES)[keyof typeof TRANSLATION_LOAD_STATES];
