import { getDomainTranslationRegistry } from "./domain-translations.js";
import { I18nextAdapter } from "./i18next-adapter.js";
import type { TranslationResources } from "./i18next-adapter.js";
import type { ModuleTranslations } from "./module-translations.js";
import type { LocaleCode, LocaleConfig } from "./types.js";
import { DEFAULT_LOCALES } from "./utils/locale-config.js";

/**
 * Configures the {@link createI18nConfig} factory function.
 */
export interface CreateI18nConfigOptions {
  /** Initial locale to activate (defaults to `"en"`). */
  defaultLocale?: LocaleCode;
  /** Fallback locale for missing translations (defaults to `"en"`). */
  fallbackLocale?: LocaleCode;
  /**
   * Supported locale configurations (defaults to {@link DEFAULT_LOCALES}).
   *
   * Accepts locale codes (`string`) or full {@link LocaleConfig} objects.
   * String codes are resolved against {@link DEFAULT_LOCALES}; unrecognized
   * codes produce a minimal config with the code as both `name` and `englishName`.
   */
  supportedLocales?: (LocaleCode | LocaleConfig)[];
  /** Language detection configuration. */
  detection?: {
    order: ("localStorage" | "navigator")[];
    /** localStorage key for persisting the selected locale (defaults to `"i18n:locale"`). */
    storageKey?: string;
  };
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
    supportedLocales: rawLocales = DEFAULT_LOCALES,
    detection,
    moduleTranslations = [],
    debug = false,
  } = options;

  const supportedLocales = rawLocales.map((locale) =>
    typeof locale === "string" ? resolveLocaleConfig(locale) : locale,
  );

  const supportedCodes = new Set(supportedLocales.map((l) => l.code));

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

  const storageKey = detection?.storageKey ?? "i18n:locale";
  const detectedLocale = detection
    ? detectLocale(detection, supportedCodes)
    : undefined;

  const i18nReady = (async () => {
    await adapter.initialize(detectedLocale ?? defaultLocale);

    if (detection?.order.includes("localStorage")) {
      persistLocale(adapter, storageKey);
    }

    for (const mod of moduleTranslations) {
      for (const locale of mod.locales) {
        const translations = await mod.load(locale);
        for (const [componentPath, data] of Object.entries(translations)) {
          const namespace = `${mod.namespace}/${componentPath}`;
          adapter.addResources(locale, namespace, data);
        }
      }
    }

    // Load domain translations from the global registry
    for (const [, config] of getDomainTranslationRegistry()) {
      for (const [locale, loader] of Object.entries(config.locales)) {
        const mod = await loader();
        const json =
          (mod as Record<string, unknown>).default ?? (mod as unknown);
        for (const [key, data] of Object.entries(
          json as Record<string, unknown>,
        )) {
          if (key === "enums") {
            adapter.addResources(
              locale,
              "enums",
              data as Record<string, unknown>,
            );
          } else {
            adapter.addResources(
              locale,
              `entity/${key}`,
              data as Record<string, unknown>,
            );
          }
        }
      }
    }
  })();

  return { adapter, i18nReady };
}

const DEFAULT_LOCALE_MAP = new Map(
  DEFAULT_LOCALES.map((l) => [l.code, l]),
);

function resolveLocaleConfig(code: LocaleCode): LocaleConfig {
  return (
    DEFAULT_LOCALE_MAP.get(code) ?? {
      code,
      name: code,
      englishName: code,
    }
  );
}

function detectLocale(
  detection: NonNullable<CreateI18nConfigOptions["detection"]>,
  supportedCodes: Set<LocaleCode>,
): LocaleCode | undefined {
  const storageKey = detection.storageKey ?? "i18n:locale";

  for (const source of detection.order) {
    if (source === "localStorage" && typeof localStorage !== "undefined") {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored && supportedCodes.has(stored)) return stored;
      } catch {
        // localStorage may be unavailable (e.g. privacy mode)
      }
    } else if (source === "navigator" && typeof navigator !== "undefined") {
      for (const lang of navigator.languages ?? []) {
        if (supportedCodes.has(lang)) return lang;
        const prefix = lang.split("-")[0]!;
        if (supportedCodes.has(prefix)) return prefix;
      }
    }
  }

  return undefined;
}

function persistLocale(adapter: I18nextAdapter, storageKey: string): void {
  if (typeof localStorage === "undefined") return;

  adapter.onLocaleChange((locale) => {
    try {
      localStorage.setItem(storageKey, locale);
    } catch {
      // localStorage may be unavailable
    }
  });
}
