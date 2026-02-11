import type {
  LocaleCode,
  TranslationValues,
  LocaleInfo,
  DateTimeFormatOptions,
  NumberFormatOptions,
  PluralForms,
  TranslationLoadState,
  TranslationNamespace,
} from "./types.js";

/**
 * Defines the contract for an internationalization adapter.
 *
 * Provides translation lookup, locale management, and formatting capabilities.
 * Implement this interface to integrate a custom i18n backend.
 *
 * @see {@link I18nextAdapter} for the built-in i18next implementation.
 *
 * @example
 * ```ts
 * import type { II18nAdapter } from "@simplix-react/i18n";
 *
 * class CustomAdapter implements II18nAdapter {
 *   // ... implement all required members
 * }
 * ```
 */
export interface II18nAdapter {
  /** Unique identifier for this adapter implementation. */
  readonly id: string;
  /** Human-readable name for this adapter. */
  readonly name: string;
  /** Currently active locale code. */
  readonly locale: LocaleCode;
  /** Locale code used when a translation key is missing in the active locale. */
  readonly fallbackLocale: LocaleCode;
  /** List of all locale codes supported by this adapter. */
  readonly availableLocales: LocaleCode[];

  /**
   * Initializes the adapter with an optional default locale.
   * @param defaultLocale - The locale to activate on initialization.
   */
  initialize(defaultLocale?: LocaleCode): Promise<void>;

  /** Disposes of the adapter and releases all resources. */
  dispose(): Promise<void>;

  /**
   * Changes the active locale.
   * @param locale - The target locale code.
   */
  setLocale(locale: LocaleCode): Promise<void>;

  /**
   * Returns metadata for the given locale, or `null` if unsupported.
   * @param locale - The locale code to look up.
   */
  getLocaleInfo(locale: LocaleCode): LocaleInfo | null;

  /**
   * Translates a key with optional interpolation values.
   * @param key - The translation key.
   * @param values - Interpolation values.
   */
  t(key: string, values?: TranslationValues): string;

  /**
   * Translates a namespaced key with optional interpolation values.
   * @param namespace - The translation namespace.
   * @param key - The translation key within the namespace.
   * @param values - Interpolation values.
   */
  tn(
    namespace: TranslationNamespace,
    key: string,
    values?: TranslationValues,
  ): string;

  /**
   * Translates a key with plural form selection based on count.
   * @param key - The translation key.
   * @param count - The count for plural selection.
   * @param values - Additional interpolation values.
   */
  tp(key: string, count: number, values?: TranslationValues): string;

  /**
   * Checks whether a translation key exists.
   * @param key - The translation key to check.
   * @param namespace - Optional namespace to scope the lookup.
   */
  exists(key: string, namespace?: TranslationNamespace): boolean;

  /**
   * Formats a date according to the active locale.
   * @param date - The date to format.
   * @param options - Formatting options.
   */
  formatDate(date: Date, options?: DateTimeFormatOptions): string;

  /**
   * Formats a time according to the active locale.
   * @param date - The date/time to format.
   * @param options - Formatting options.
   */
  formatTime(date: Date, options?: DateTimeFormatOptions): string;

  /**
   * Formats a date and time together according to the active locale.
   * @param date - The date/time to format.
   * @param options - Formatting options.
   */
  formatDateTime(date: Date, options?: DateTimeFormatOptions): string;

  /**
   * Formats a date as a human-readable relative time string (e.g., "3 hours ago").
   * @param date - The date to compare against the current time.
   */
  formatRelativeTime(date: Date): string;

  /**
   * Formats a number according to the active locale.
   * @param value - The number to format.
   * @param options - Formatting options.
   */
  formatNumber(value: number, options?: NumberFormatOptions): string;

  /**
   * Formats a number as a currency string according to the active locale.
   * @param value - The monetary value to format.
   * @param currency - ISO 4217 currency code override (defaults to the locale's currency).
   */
  formatCurrency(value: number, currency?: string): string;

  /**
   * Loads translation resources for a given locale and namespace.
   * @param locale - The target locale code.
   * @param namespace - The translation namespace.
   * @param translations - The translation key-value pairs to load.
   */
  loadTranslations(
    locale: LocaleCode,
    namespace: TranslationNamespace,
    translations: Record<string, string | PluralForms>,
  ): void;

  /**
   * Returns the loading state of translation resources.
   * @param locale - The locale to check.
   * @param namespace - Optional namespace to check (defaults to `"translation"`).
   */
  getLoadState(
    locale: LocaleCode,
    namespace?: TranslationNamespace,
  ): TranslationLoadState;

  /**
   * Registers a callback invoked whenever the active locale changes.
   * @param handler - The callback receiving the new locale code.
   * @returns A function that unregisters the handler when called.
   */
  onLocaleChange(handler: (locale: LocaleCode) => void): () => void;
}
