import { I18nextAdapter } from "./i18next-adapter.js";
import type {
  TranslationResources,
  LocaleConfig,
} from "./i18next-adapter.js";
import type { ModuleTranslations } from "./module-translations.js";
import type { LocaleCode } from "./types.js";
import { DEFAULT_LOCALES } from "./utils/locale-config.js";

/**
 * Configures the {@link createI18nConfig} factory function.
 */
export interface CreateI18nConfigOptions {
  /** Initial locale to activate (defaults to `"en"`). */
  defaultLocale?: LocaleCode;
  /** Fallback locale for missing translations (defaults to `"en"`). */
  fallbackLocale?: LocaleCode;
  /** Supported locale configurations (defaults to {@link DEFAULT_LOCALES}). */
  supportedLocales?: LocaleConfig[];
  /** Language detection configuration. */
  detection?: { order: string[] };
  /**
   * Eagerly imported application translations, typically from `import.meta.glob`.
   *
   * Keys should follow the pattern `/locales/{namespace}/{locale}.json`.
   */
  appTranslations?: Record<string, unknown>;
  /** Lazy-loadable module translation descriptors built via {@link buildModuleTranslations}. */
  moduleTranslations?: ModuleTranslations[];
  /** Enables i18next debug logging. */
  debug?: boolean;
}

/**
 * Represents the result of {@link createI18nConfig}.
 */
export interface I18nConfigResult {
  /** The configured i18next adapter instance. */
  adapter: I18nextAdapter;
  /** A promise that resolves when all translations (including module translations) are loaded. */
  i18nReady: Promise<void>;
}

/**
 * Creates and initializes an i18n configuration with an {@link I18nextAdapter}.
 *
 * Handles eager loading of app-level translations and lazy loading of module translations.
 * Returns both the adapter instance and a promise that resolves when initialization is complete.
 *
 * @param options - The i18n configuration options.
 * @returns An {@link I18nConfigResult} containing the adapter and a readiness promise.
 *
 * @example
 * ```ts
 * import { createI18nConfig } from "@simplix-react/i18n";
 *
 * const appTranslations = import.meta.glob("./locales/**\/*.json", { eager: true });
 *
 * const { adapter, i18nReady } = createI18nConfig({
 *   defaultLocale: "ko",
 *   appTranslations,
 * });
 *
 * await i18nReady;
 * adapter.t("common:greeting"); // "안녕하세요"
 * ```
 */
export function createI18nConfig(
  options: CreateI18nConfigOptions,
): I18nConfigResult {
  const {
    defaultLocale = "en",
    fallbackLocale = "en",
    supportedLocales = DEFAULT_LOCALES,
    moduleTranslations = [],
    debug = false,
  } = options;

  // Build initial resources from app translations (eager imports from Vite glob)
  const resources: TranslationResources = {};

  if (options.appTranslations) {
    for (const [filePath, content] of Object.entries(
      options.appTranslations,
    )) {
      const match = filePath.match(/\/locales\/(.+?)\/(\w+)\.json$/);
      if (!match) continue;

      const namespace = match[1]!;
      const locale = match[2]!;
      if (!resources[locale]) resources[locale] = {};
      const mod = content as Record<string, unknown>;
      resources[locale][namespace] = (mod.default ??
        mod) as Record<string, unknown>;
    }
  }

  const adapter = new I18nextAdapter({
    defaultLocale,
    fallbackLocale,
    locales: supportedLocales,
    resources,
    debug,
  });

  const i18nReady = (async () => {
    await adapter.initialize(defaultLocale);

    for (const mod of moduleTranslations) {
      for (const locale of mod.locales) {
        const translations = await mod.load(locale);
        for (const [componentPath, data] of Object.entries(translations)) {
          const namespace = `${mod.namespace}/${componentPath}`;
          adapter.addResources(locale, namespace, data);
        }
      }
    }
  })();

  return { adapter, i18nReady };
}
