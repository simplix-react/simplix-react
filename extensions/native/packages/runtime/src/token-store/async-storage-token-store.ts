import AsyncStorage from "@react-native-async-storage/async-storage";

import type { NativeTokenStore } from "./types";

/** Options for {@link createAsyncStorageTokenStore}. */
export interface AsyncStorageTokenStoreOptions {
  /** Prefix for the underlying AsyncStorage keys. Defaults to `"simplix.store."`. */
  keyPrefix?: string;
}

/**
 * AsyncStorage-backed store satisfying the synchronous framework `TokenStore`
 * contract through an in-memory write-through cache. For NON-secret values
 * (preferences, device ids) — secrets belong in {@link createSecureTokenStore}.
 */
export function createAsyncStorageTokenStore(
  options?: AsyncStorageTokenStoreOptions,
): NativeTokenStore {
  const prefix = options?.keyPrefix ?? "simplix.store.";
  const cache = new Map<string, string>();
  let hydrated = false;
  let hydration: Promise<void> | null = null;

  const assertHydrated = (operation: string): void => {
    if (!hydrated) {
      throw new Error(
        `AsyncStorageTokenStore.${operation} called before hydrate() completed — await hydrate() during app boot`,
      );
    }
  };

  return {
    get hydrated() {
      return hydrated;
    },
    async hydrate() {
      if (hydrated) return;
      if (!hydration) {
        hydration = (async () => {
          const allKeys = await AsyncStorage.getAllKeys();
          const scoped = allKeys.filter((key) => key.startsWith(prefix));
          const pairs = await AsyncStorage.multiGet(scoped);
          for (const [storageKey, value] of pairs) {
            if (value !== null) cache.set(storageKey.slice(prefix.length), value);
          }
          hydrated = true;
        })();
      }
      return hydration;
    },
    get(key: string): string | null {
      assertHydrated("get");
      return cache.get(key) ?? null;
    },
    set(key: string, value: string): void {
      assertHydrated("set");
      cache.set(key, value);
      void AsyncStorage.setItem(`${prefix}${key}`, value).catch((error: unknown) => {
        console.error("AsyncStorageTokenStore: failed to persist", key, error);
      });
    },
    remove(key: string): void {
      assertHydrated("remove");
      cache.delete(key);
      void AsyncStorage.removeItem(`${prefix}${key}`).catch((error: unknown) => {
        console.error("AsyncStorageTokenStore: failed to remove", key, error);
      });
    },
    clear(): void {
      assertHydrated("clear");
      const keys = [...cache.keys()];
      cache.clear();
      void AsyncStorage.multiRemove(keys.map((key) => `${prefix}${key}`)).catch(
        (error: unknown) => {
          console.error("AsyncStorageTokenStore: failed to clear", error);
        },
      );
    },
  };
}
