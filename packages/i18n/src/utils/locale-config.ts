import type { LocaleConfig } from "../i18next-adapter.js";

/**
 * Provides built-in locale configurations for Korean, English, and Japanese.
 *
 * Used as the default value for `supportedLocales` in {@link createI18nConfig}.
 */
export const DEFAULT_LOCALES: LocaleConfig[] = [
  {
    code: "ko",
    name: "한국어",
    englishName: "Korean",
    direction: "ltr",
    dateFormat: "yyyy-MM-dd",
    timeFormat: "HH:mm:ss",
    currency: "KRW",
  },
  {
    code: "en",
    name: "English",
    englishName: "English",
    direction: "ltr",
    dateFormat: "MM/dd/yyyy",
    timeFormat: "h:mm:ss a",
    currency: "USD",
  },
  {
    code: "ja",
    name: "日本語",
    englishName: "Japanese",
    direction: "ltr",
    dateFormat: "yyyy/MM/dd",
    timeFormat: "HH:mm:ss",
    currency: "JPY",
  },
];

/**
 * Lists the locale codes from {@link DEFAULT_LOCALES} (`["ko", "en", "ja"]`).
 */
export const SUPPORTED_LOCALES = DEFAULT_LOCALES.map((l) => l.code);
