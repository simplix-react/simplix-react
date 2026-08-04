/**
 * Realm-wide state that survives this package being loaded more than once.
 *
 * A bundle can legitimately contain two copies of `@simplix-react/i18n`. A locally
 * linked framework checkout answers its own peer imports from its own workspace, and
 * a package manager keeps one physical copy per peer-dependency resolution, so the
 * copy `@simplix-react/ui` imports is not always the copy the application imports.
 * Module-level state then splits in two: the registry a package writes its catalogue
 * into is not the registry `createI18nConfig` reads, and the React context a provider
 * fills is not the context a component subscribes to.
 *
 * Neither split raises anything. `useTranslation` falls back to returning the key it
 * was handed, so every framework string renders as `list.totalCount` / `common.close`
 * while the code producing it is correct — the failure is visible only on screen.
 *
 * Anchoring that state on `globalThis` under a well-known key hands every copy the same
 * object. The key carries a state version so a later, incompatible shape starts its own
 * state instead of adopting what an older copy wrote.
 */
const STATE_VERSION = 1;

/**
 * Returns the one instance of a named piece of state for this realm, creating it on
 * first use.
 *
 * @param name - Identifies the state within this package (e.g. `"module-registry"`).
 * @param create - Produces the initial value; called at most once per realm.
 * @returns The shared instance — identical across every loaded copy of this package.
 *
 * @example
 * ```ts
 * const registry = sharedState("module-registry", () => new Map<string, Entry>());
 * ```
 */
export function sharedState<T>(name: string, create: () => T): T {
  const key = Symbol.for(`@simplix-react/i18n@${STATE_VERSION}:${name}`);
  const realm = globalThis as unknown as Record<symbol, unknown>;
  const existing = realm[key];
  if (existing !== undefined) return existing as T;

  const created = create();
  realm[key] = created;
  return created;
}
