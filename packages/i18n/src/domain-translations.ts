/**
 * Configuration for registering domain-specific translations.
 *
 * Each domain package (e.g., `domain-pet`, `domain-store`) provides
 * its own translation files via this interface.
 */
export interface DomainTranslationConfig {
  /** Unique domain identifier (e.g., `"pet"`, `"store"`). */
  domain: string;
  /** Map of locale codes to lazy-loading functions for translation JSON files. */
  locales: Record<string, () => Promise<{ default: Record<string, unknown> }>>;
}

const registry = new Map<string, DomainTranslationConfig>();

/** Listener invoked whenever domain translations are (re)registered. */
export type DomainTranslationsListener = (
  config: DomainTranslationConfig,
) => void;

const domainListeners = new Set<DomainTranslationsListener>();

/**
 * Subscribes to future {@link registerDomainTranslations} calls.
 *
 * Used internally by {@link createI18nConfig} so domain packages whose module
 * evaluation happens after i18n initialization (lazy bundles, inline
 * requires) still get their translations loaded into the active adapter.
 *
 * @param listener - Called with each newly registered configuration.
 * @returns An unsubscribe function.
 */
export function onDomainTranslationsRegistered(
  listener: DomainTranslationsListener,
): () => void {
  domainListeners.add(listener);
  return () => {
    domainListeners.delete(listener);
  };
}

/**
 * Registers domain-specific translations into the global registry.
 *
 * Call this as a side-effect import in your domain package's entry point
 * so translations are available when the package is imported.
 *
 * @param config - The domain translation configuration.
 *
 * @example
 * ```ts
 * import { registerDomainTranslations } from "@simplix-react/i18n";
 *
 * registerDomainTranslations({
 *   domain: "pet",
 *   locales: {
 *     en: () => import("./locales/en.json"),
 *     ko: () => import("./locales/ko.json"),
 *   },
 * });
 * ```
 */
export function registerDomainTranslations(
  config: DomainTranslationConfig,
): void {
  registry.set(config.domain, config);
  for (const listener of domainListeners) {
    listener(config);
  }
}

/**
 * Returns a read-only view of the domain translation registry.
 *
 * Used internally by {@link createI18nConfig} to load all registered
 * domain translations during initialization.
 *
 * @returns A `ReadonlyMap` keyed by domain name to {@link DomainTranslationConfig}.
 */
export function getDomainTranslationRegistry(): ReadonlyMap<
  string,
  DomainTranslationConfig
> {
  return registry;
}
