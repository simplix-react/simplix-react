import i18next, { type i18n as I18nextInstance } from "i18next";
import type { II18nAdapter } from "./adapter.js";
import type {
  DateTimeFormatOptions,
  LocaleCode,
  LocaleInfo,
  NumberFormatOptions,
  PluralForms,
  TranslationLoadState,
  TranslationNamespace,
  TranslationValues,
} from "./types.js";

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
 * Represents a nested structure of translation resources keyed by locale, then namespace.
 *
 * @example
 * ```ts
 * import type { TranslationResources } from "@simplix-react/i18n";
 *
 * const resources: TranslationResources = {
 *   en: { common: { greeting: "Hello" } },
 *   ko: { common: { greeting: "안녕하세요" } },
 * };
 * ```
 */
export type TranslationResources = Record<
  LocaleCode,
  Record<TranslationNamespace, Record<string, unknown>>
>;

/**
 * Configures the {@link I18nextAdapter} constructor.
 */
export interface I18nextAdapterOptions {
  /** Initial locale to use (defaults to `"en"`). */
  defaultLocale?: LocaleCode;
  /** Fallback locale when a key is missing (defaults to `"en"`). */
  fallbackLocale?: LocaleCode;
  /** Supported locale configurations. */
  locales?: LocaleConfig[];
  /** Pre-loaded translation resources. */
  resources?: TranslationResources;
  /** An existing i18next instance to reuse instead of creating a new one. */
  i18nextInstance?: I18nextInstance;
  /** Enables i18next debug logging. */
  debug?: boolean;
}

const BUILTIN_LOCALES: LocaleConfig[] = [
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
 * Implements {@link II18nAdapter} using i18next as the underlying translation engine.
 *
 * Provides locale-aware translation, date/time/number formatting via the `Intl` API,
 * and reactive locale change notifications.
 *
 * @example
 * ```ts
 * import { I18nextAdapter } from "@simplix-react/i18n";
 *
 * const adapter = new I18nextAdapter({
 *   defaultLocale: "ko",
 *   resources: {
 *     ko: { common: { greeting: "안녕하세요, {{name}}!" } },
 *     en: { common: { greeting: "Hello, {{name}}!" } },
 *   },
 * });
 *
 * await adapter.initialize();
 * adapter.tn("common", "greeting", { name: "Alice" }); // "안녕하세요, Alice!"
 * ```
 */
export class I18nextAdapter implements II18nAdapter {
  readonly id = "i18next";
  readonly name = "i18next Adapter";

  private i18n: I18nextInstance;
  private initialized = false;
  private localeConfigs: Map<LocaleCode, LocaleConfig>;
  private defaultLocale: LocaleCode;
  private _fallbackLocale: LocaleCode;
  private resources: TranslationResources;
  private debug: boolean;
  private localeChangeHandlers: Set<(locale: LocaleCode) => void> = new Set();

  constructor(options: I18nextAdapterOptions = {}) {
    this.defaultLocale = options.defaultLocale ?? "en";
    this._fallbackLocale = options.fallbackLocale ?? "en";
    this.resources = options.resources ?? {};
    this.debug = options.debug ?? false;
    this.i18n = options.i18nextInstance ?? i18next.createInstance();

    const locales = options.locales ?? BUILTIN_LOCALES;
    this.localeConfigs = new Map(locales.map((l) => [l.code, l]));
  }

  get locale(): LocaleCode {
    return this.i18n.language ?? this.defaultLocale;
  }

  get fallbackLocale(): LocaleCode {
    return this._fallbackLocale;
  }

  get availableLocales(): LocaleCode[] {
    return Array.from(this.localeConfigs.keys());
  }

  async initialize(defaultLocale?: LocaleCode): Promise<void> {
    if (this.initialized) return;

    const isAlreadyInitialized = this.i18n.isInitialized;

    if (!isAlreadyInitialized) {
      const locale = defaultLocale ?? this.defaultLocale;

      await this.i18n.init({
        lng: locale,
        fallbackLng: this._fallbackLocale,
        resources: this.resources,
        interpolation: {
          escapeValue: false,
        },
        debug: this.debug,
        returnNull: false,
        returnEmptyString: false,
      });
    }

    this.i18n.on("languageChanged", (lng) => {
      this.notifyLocaleChange(lng);
    });

    this.initialized = true;
  }

  async dispose(): Promise<void> {
    this.localeChangeHandlers.clear();
    this.initialized = false;
  }

  async setLocale(locale: LocaleCode): Promise<void> {
    if (!this.localeConfigs.has(locale)) {
      throw new Error(`Unsupported locale: ${locale}`);
    }

    await this.i18n.changeLanguage(locale);
  }

  getLocaleInfo(locale: LocaleCode): LocaleInfo | null {
    const config = this.localeConfigs.get(locale);
    if (!config) return null;

    return {
      code: config.code,
      name: config.name,
      englishName: config.englishName,
      direction: config.direction ?? "ltr",
      dateFormat: config.dateFormat ?? "yyyy-MM-dd",
      timeFormat: config.timeFormat ?? "HH:mm:ss",
      currency: config.currency ?? "USD",
    };
  }

  t(key: string, values?: TranslationValues): string {
    return this.i18n.t(key, values as Record<string, unknown>) ?? key;
  }

  tn(
    namespace: TranslationNamespace,
    key: string,
    values?: TranslationValues,
  ): string {
    return (
      this.i18n.t(`${namespace}:${key}`, values as Record<string, unknown>) ??
      key
    );
  }

  tp(key: string, count: number, values?: TranslationValues): string {
    return this.i18n.t(key, { count, ...values }) ?? key;
  }

  exists(key: string, namespace?: TranslationNamespace): boolean {
    const fullKey = namespace ? `${namespace}:${key}` : key;
    return this.i18n.exists(fullKey);
  }

  formatDate(date: Date, options?: DateTimeFormatOptions): string {
    const locale = this.locale;
    const intlOptions: Intl.DateTimeFormatOptions = {};

    if (options?.dateStyle) {
      intlOptions.dateStyle = options.dateStyle;
    } else {
      intlOptions.year = "numeric";
      intlOptions.month = "2-digit";
      intlOptions.day = "2-digit";
    }

    return new Intl.DateTimeFormat(locale, intlOptions).format(date);
  }

  formatTime(date: Date, options?: DateTimeFormatOptions): string {
    const locale = this.locale;
    const intlOptions: Intl.DateTimeFormatOptions = {};

    if (options?.timeStyle) {
      intlOptions.timeStyle = options.timeStyle;
    } else {
      intlOptions.hour = "2-digit";
      intlOptions.minute = "2-digit";
      intlOptions.second = "2-digit";
    }

    if (options?.hour12 !== undefined) {
      intlOptions.hour12 = options.hour12;
    }

    return new Intl.DateTimeFormat(locale, intlOptions).format(date);
  }

  formatDateTime(date: Date, options?: DateTimeFormatOptions): string {
    const locale = this.locale;
    const intlOptions: Intl.DateTimeFormatOptions = {};

    if (options?.dateStyle) {
      intlOptions.dateStyle = options.dateStyle;
    }
    if (options?.timeStyle) {
      intlOptions.timeStyle = options.timeStyle;
    }
    if (options?.hour12 !== undefined) {
      intlOptions.hour12 = options.hour12;
    }

    if (!options?.dateStyle && !options?.timeStyle) {
      intlOptions.dateStyle = "medium";
      intlOptions.timeStyle = "medium";
    }

    return new Intl.DateTimeFormat(locale, intlOptions).format(date);
  }

  formatRelativeTime(date: Date): string {
    const locale = this.locale;
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (Math.abs(diffSec) < 60) {
      return rtf.format(diffSec, "second");
    } else if (Math.abs(diffMin) < 60) {
      return rtf.format(diffMin, "minute");
    } else if (Math.abs(diffHour) < 24) {
      return rtf.format(diffHour, "hour");
    } else {
      return rtf.format(diffDay, "day");
    }
  }

  formatNumber(value: number, options?: NumberFormatOptions): string {
    const locale = this.locale;
    const intlOptions: Intl.NumberFormatOptions = {};

    if (options?.style) {
      intlOptions.style = options.style;
    }
    if (options?.currency) {
      intlOptions.currency = options.currency;
    }
    if (options?.unit) {
      intlOptions.unit = options.unit;
    }
    if (options?.minimumFractionDigits !== undefined) {
      intlOptions.minimumFractionDigits = options.minimumFractionDigits;
    }
    if (options?.maximumFractionDigits !== undefined) {
      intlOptions.maximumFractionDigits = options.maximumFractionDigits;
    }

    return new Intl.NumberFormat(locale, intlOptions).format(value);
  }

  formatCurrency(value: number, currency?: string): string {
    const locale = this.locale;
    const localeInfo = this.getLocaleInfo(locale);
    const currencyCode = currency ?? localeInfo?.currency ?? "USD";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
    }).format(value);
  }

  loadTranslations(
    locale: LocaleCode,
    namespace: TranslationNamespace,
    translations: Record<string, string | PluralForms>,
  ): void {
    this.i18n.addResourceBundle(locale, namespace, translations, true, true);
  }

  getLoadState(
    locale: LocaleCode,
    namespace?: TranslationNamespace,
  ): TranslationLoadState {
    if (!this.initialized) return "idle";

    const hasLocale = this.i18n.hasResourceBundle(
      locale,
      namespace ?? "translation",
    );

    return hasLocale ? "loaded" : "idle";
  }

  onLocaleChange(handler: (locale: LocaleCode) => void): () => void {
    this.localeChangeHandlers.add(handler);
    return () => {
      this.localeChangeHandlers.delete(handler);
    };
  }

  /**
   * Adds translation resources to the underlying i18next instance, merging with any existing resources.
   * @param locale - The target locale code.
   * @param namespace - The translation namespace.
   * @param resources - The translation key-value pairs to add.
   */
  addResources(
    locale: LocaleCode,
    namespace: TranslationNamespace,
    resources: Record<string, unknown>,
  ): void {
    this.i18n.addResourceBundle(locale, namespace, resources, true, true);
  }

  /**
   * Returns the underlying i18next instance for advanced usage or direct integration with `react-i18next`.
   */
  getI18nextInstance(): I18nextInstance {
    return this.i18n;
  }

  private notifyLocaleChange(locale: LocaleCode): void {
    for (const handler of this.localeChangeHandlers) {
      try {
        handler(locale);
      } catch (error) {
        console.error("Error in locale change handler:", error);
      }
    }
  }
}
