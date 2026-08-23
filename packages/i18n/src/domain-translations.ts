import { sharedState } from "./utils/shared-state.js";

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

// Realm-wide, not module-wide — see `sharedState` for why a second copy of this
// module is a silent failure rather than an error.
const registry = sharedState(
  "domain-registry",
  () => new Map<string, DomainTranslationConfig>(),
);

/** Listener invoked whenever domain translations are (re)registered. */
export type DomainTranslationsListener = (
  config: DomainTranslationConfig,
) => void;

const domainListeners = sharedState(
  "domain-listeners",
  () => new Set<DomainTranslationsListener>(),
);

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
  registry.set(registryKeyFor(config), config);
  for (const listener of domainListeners) {
    listener(config);
  }
}

/**
 * Where this registration is filed, keeping two packages that spell the same domain name apart.
 *
 * @remarks
 * A domain name belongs to whoever spells it, and two packages legitimately spell the same one —
 * an extension shipping `auth` and the application's own generated `auth` domain. Filed under the
 * name alone the second registration replaces the first, whose entire catalogue is then never
 * loaded: every field it names renders as `fields.<name>` on screen while both packages' code is
 * correct and nothing throws. So a name already held by a DIFFERENT registration gets a key of its
 * own and both catalogues load; the namespaces come from each JSON's own top-level keys, so two
 * registrations under one name contribute different namespaces rather than fighting over one.
 *
 * Re-registering the same object — a module evaluated twice — still replaces, which is what the
 * name-keying was for.
 *
 * @param config - The registration being filed
 * @returns The key to store it under
 */
function registryKeyFor(config: DomainTranslationConfig): string {
  const held = registry.get(config.domain);
  if (!held || held === config) return config.domain;
  for (const [key, existing] of registry) {
    if (existing === config) return key;
  }
  let suffix = 2;
  while (registry.has(`${config.domain}#${suffix}`)) suffix += 1;
  return `${config.domain}#${suffix}`;
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
