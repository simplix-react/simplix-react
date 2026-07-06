import { queryOptions } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import type { PersistQueryClientOptions } from "@tanstack/react-query-persist-client";

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Options for {@link createLocalQueryStore}.
 */
export interface LocalQueryStoreOptions {
  /**
   * Cache-busting token. On restore, a mismatch discards the entire persisted
   * cache — bump it whenever the persisted shape (or app version) changes.
   */
  version: string;

  /** `localStorage` key the dehydrated cache is written under. */
  storageKey: string;

  /**
   * Maximum age of the persisted cache; entries older than this are dropped on
   * restore. Defaults to 24 hours.
   */
  maxAge?: number;

  /**
   * Storage backend. Defaults to `window.localStorage`, or a no-op when no
   * `Storage` is available (e.g. SSR).
   */
  storage?: Storage;
}

/**
 * A single locally-persisted, refetch-averse query definition.
 *
 * @typeParam TData - The resolved query data type.
 */
export interface LocalQueryDef<TData> {
  /** Stable query key; also the persistence-registry key (prefix-matched). */
  key: readonly unknown[];

  /** Fetcher invoked by react-query when the cache is missing or stale. */
  queryFn: (ctx: { signal?: AbortSignal }) => Promise<TData>;

  /** Freshness window. Defaults to `Infinity` (refetch only on invalidation). */
  staleTime?: number;

  /** GC window. Defaults to the store's `maxAge` so persisted data survives restore. */
  gcTime?: number;
}

/**
 * Creates an isolated "local query" store: a registry of query keys whose
 * react-query cache entries should be persisted to `localStorage` and kept
 * fresh until explicitly invalidated.
 *
 * The returned `persistOptions` is spread directly into a
 * `PersistQueryClientProvider`; only the registered keys are dehydrated (and
 * only when successful), so volatile list/detail queries are never persisted.
 *
 * @param opts - Store configuration ({@link LocalQueryStoreOptions}).
 * @returns `localQuery` (define + register an app-owned query), `localQueryKey`
 *   (register a framework-owned query by key only), and `persistOptions` for the
 *   provider.
 *
 * @example
 * ```ts
 * const store = createLocalQueryStore({ version: "1", storageKey: "app:cache" });
 * store.localQueryKey(["menu", "tree"]);                 // framework-owned
 * const policy = store.localQuery({ key: ["policy"], queryFn });  // app-owned
 * // <PersistQueryClientProvider client={qc} persistOptions={store.persistOptions} />
 * ```
 */
export function createLocalQueryStore(opts: LocalQueryStoreOptions) {
  const maxAge = opts.maxAge ?? ONE_DAY_MS;
  const keys: (readonly unknown[])[] = [];

  const sameKey = (a: readonly unknown[], b: readonly unknown[]): boolean =>
    a.length === b.length && a.every((seg, i) => seg === b[i]);

  const isRegistered = (queryKey: readonly unknown[]): boolean =>
    keys.some((prefix) => prefix.every((seg, i) => queryKey[i] === seg));

  /**
   * Registers a query key (prefix) for persistence without owning its fetch —
   * use this for queries owned by a framework provider (e.g. a menu provider).
   *
   * @param key - The query key prefix to persist (e.g. `["menu", "tree"]`).
   */
  function localQueryKey(key: readonly unknown[]): void {
    if (!keys.some((k) => sameKey(k, key))) keys.push(key);
  }

  /**
   * Defines an app-owned query and registers its key for persistence. Returns
   * a `queryOptions` object consumable by `useQuery`.
   *
   * @typeParam TData - The resolved query data type.
   * @param def - The query definition ({@link LocalQueryDef}).
   * @returns A `queryOptions` object (staleTime `Infinity` and gcTime `maxAge` by default).
   */
  function localQuery<TData>(def: LocalQueryDef<TData>) {
    localQueryKey(def.key);
    return queryOptions({
      queryKey: def.key,
      queryFn: def.queryFn,
      staleTime: def.staleTime ?? Infinity,
      gcTime: def.gcTime ?? maxAge,
    });
  }

  const persister = createSyncStoragePersister({
    storage:
      opts.storage ??
      (typeof window !== "undefined" ? window.localStorage : undefined),
    key: opts.storageKey,
  });

  const persistOptions: Omit<PersistQueryClientOptions, "queryClient"> = {
    persister,
    maxAge,
    buster: opts.version,
    dehydrateOptions: {
      // A custom predicate REPLACES react-query's default success-only check, so
      // the success baseline (`status === "success"`) is inlined here alongside
      // the registry filter. `query` is typed from PersistQueryClientOptions, so
      // only its cross-version-stable members (`state.status`, `queryKey`) are read.
      shouldDehydrateQuery: (query) =>
        query.state.status === "success" && isRegistered(query.queryKey),
    },
  };

  return { localQuery, localQueryKey, persistOptions };
}
