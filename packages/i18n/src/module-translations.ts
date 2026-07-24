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
  /**
   * Component paths served by this descriptor. Part of the registry identity:
   * several packages may share one namespace with disjoint components (e.g.
   * `simplix/native` and `simplix/native-qr`), so the namespace alone must
   * not be the registry key or later registrations clobber earlier ones.
   */
  components?: string[];
  /** Loads all component translations for the given locale. */
  load: (locale: string) => Promise<Record<string, Record<string, unknown>>>;
}

const moduleRegistry = new Map<string, ModuleTranslations>();

/** Listener invoked whenever module translations are (re)registered. */
export type ModuleTranslationsListener = (
  translations: ModuleTranslations,
) => void;

const moduleListeners = new Set<ModuleTranslationsListener>();

/**
 * Subscribes to future {@link registerModuleTranslations} calls.
 *
 * Used internally by {@link createI18nConfig} so packages whose module
 * evaluation happens after i18n initialization (lazy bundles, inline
 * requires) still get their translations loaded into the active adapter.
 *
 * @param listener - Called with each newly registered descriptor.
 * @returns An unsubscribe function.
 */
export function onModuleTranslationsRegistered(
  listener: ModuleTranslationsListener,
): () => void {
  moduleListeners.add(listener);
  return () => {
    moduleListeners.delete(listener);
  };
}

/**
 * Registers module translations into the global registry.
 *
 * Call this as a side-effect import in your module package's entry point
 * so translations are available when the package is imported.
 *
 * @param translations - The module translation descriptor built via {@link buildModuleTranslations}.
 *
 * @example
 * ```ts
 * import { buildModuleTranslations, registerModuleTranslations } from "@simplix-react/i18n";
 *
 * const translations = buildModuleTranslations({
 *   namespace: "dashboard",
 *   locales: ["en", "ko"],
 *   components: { ... },
 * });
 *
 * registerModuleTranslations(translations);
 * ```
 */
export function registerModuleTranslations(
  translations: ModuleTranslations,
): void {
  moduleRegistry.set(registryKeyOf(translations), translations);
  for (const listener of moduleListeners) {
    listener(translations);
  }
}

/**
 * Registry key: namespace plus the component paths, so packages sharing a
 * namespace coexist while a package re-registering replaces itself.
 */
function registryKeyOf(translations: ModuleTranslations): string {
  if (!translations.components || translations.components.length === 0) {
    return translations.namespace;
  }
  return `${translations.namespace}:${[...translations.components].sort().join("+")}`;
}

/**
 * Returns a read-only view of the module translation registry.
 *
 * Used internally by {@link createI18nConfig} to load all registered
 * module translations during initialization.
 *
 * @returns A `ReadonlyMap` keyed by namespace to {@link ModuleTranslations}.
 */
export function getModuleTranslationRegistry(): ReadonlyMap<
  string,
  ModuleTranslations
> {
  return moduleRegistry;
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
    components: Object.keys(options.components),
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
