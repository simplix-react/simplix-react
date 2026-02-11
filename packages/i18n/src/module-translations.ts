/**
 * Maps locale codes to lazy-loading functions that return translation modules.
 *
 * Designed to work with Vite's `import.meta.glob` for code-split translation files.
 *
 * @example
 * ```ts
 * import type { ComponentTranslations } from "@simplix-react/i18n";
 *
 * const translations: ComponentTranslations = {
 *   en: () => import("./locales/en.json"),
 *   ko: () => import("./locales/ko.json"),
 * };
 * ```
 */
export interface ComponentTranslations {
  [locale: string]: () => Promise<{ default: Record<string, unknown> }>;
}

/**
 * Configures the {@link buildModuleTranslations} function.
 */
export interface BuildModuleTranslationsOptions {
  /** Namespace prefix for all component translations in this module. */
  namespace: string;
  /** List of supported locale codes. */
  locales: string[];
  /** Map of component paths to their locale-specific translation loaders. */
  components: Record<string, ComponentTranslations>;
}

/**
 * Represents the output of {@link buildModuleTranslations}, providing a lazy-loadable
 * collection of namespaced translations for a module.
 */
export interface ModuleTranslations {
  /** The module's translation namespace. */
  namespace: string;
  /** Supported locale codes. */
  locales: string[];
  /** Loads all component translations for the given locale. */
  load: (locale: string) => Promise<Record<string, Record<string, unknown>>>;
}

/**
 * Builds a lazy-loadable module translation descriptor from per-component translation loaders.
 *
 * Aggregates component-level translations under a shared namespace so they can be
 * loaded on demand by {@link createI18nConfig}.
 *
 * @param options - The module translation configuration.
 * @returns A {@link ModuleTranslations} descriptor.
 *
 * @example
 * ```ts
 * import { buildModuleTranslations } from "@simplix-react/i18n";
 *
 * const moduleTranslations = buildModuleTranslations({
 *   namespace: "dashboard",
 *   locales: ["en", "ko"],
 *   components: {
 *     header: {
 *       en: () => import("./header/locales/en.json"),
 *       ko: () => import("./header/locales/ko.json"),
 *     },
 *   },
 * });
 * ```
 */
export function buildModuleTranslations(
  options: BuildModuleTranslationsOptions,
): ModuleTranslations {
  return {
    namespace: options.namespace,
    locales: options.locales,
    async load(locale: string) {
      const result: Record<string, Record<string, unknown>> = {};

      const entries = Object.entries(options.components);
      const loadPromises = entries.map(async ([componentPath, loaders]) => {
        const loader = loaders[locale];
        if (!loader) return;

        const mod = await loader();
        const data = (mod as Record<string, unknown>).default ?? mod;
        result[componentPath] = data as Record<string, unknown>;
      });

      await Promise.all(loadPromises);
      return result;
    },
  };
}
