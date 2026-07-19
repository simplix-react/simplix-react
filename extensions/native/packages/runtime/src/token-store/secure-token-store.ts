import * as SecureStore from "expo-secure-store";

import type { NativeTokenStore } from "./types";

/** Options for {@link createSecureTokenStore}. */
export interface SecureTokenStoreOptions {
  /**
   * Prefix for the underlying secure-store keys. Change it when one app hosts
   * several isolated token scopes. Defaults to `"simplix.token."`.
   */
  keyPrefix?: string;
}

/**
 * expo-secure-store cannot enumerate keys, so the store persists its own key
 * index alongside the entries. SecureStore keys only allow
 * `[A-Za-z0-9._-]`, hence the sanitizer.
 */
function sanitizeKey(prefix: string, key: string): string {
  return `${prefix}${key}`.replace(/[^A-Za-z0-9._-]/g, "_");
}

/**
 * Device-keychain token store (expo-secure-store) satisfying the synchronous
 * framework `TokenStore` contract through an in-memory write-through cache.
 *
 * Persistence-layer failures on write are reported to the console and the
 * in-memory state stays authoritative for the session — an authenticated
 * session must not break because the keychain write failed.
 *
 * @example
 * ```ts
 * const tokenStore = createSecureTokenStore();
 * await tokenStore.hydrate();
 * configureMutator("boot", createNativeBootMutator({ baseUrl, getToken: () => tokenStore.get("access_token") }));
 * ```
 */
export function createSecureTokenStore(
  options?: SecureTokenStoreOptions,
): NativeTokenStore {
  const prefix = options?.keyPrefix ?? "simplix.token.";
  const indexKey = sanitizeKey(prefix, "__index");
  const cache = new Map<string, string>();
  let hydrated = false;
  let hydration: Promise<void> | null = null;

  const persistIndex = async (): Promise<void> => {
    await SecureStore.setItemAsync(indexKey, JSON.stringify([...cache.keys()]));
  };

  const assertHydrated = (operation: string): void => {
    if (!hydrated) {
      throw new Error(
        `SecureTokenStore.${operation} called before hydrate() completed — await hydrate() during app boot`,
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
          const rawIndex = await SecureStore.getItemAsync(indexKey);
          if (rawIndex) {
            let keys: string[] = [];
            try {
              keys = JSON.parse(rawIndex) as string[];
            } catch {
              // A corrupt index means the entries are unreachable anyway;
              // start clean rather than failing every launch.
              keys = [];
            }
            for (const key of keys) {
              const value = await SecureStore.getItemAsync(sanitizeKey(prefix, key));
              if (value !== null) cache.set(key, value);
            }
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
      void SecureStore.setItemAsync(sanitizeKey(prefix, key), value)
        .then(persistIndex)
        .catch((error: unknown) => {
          console.error("SecureTokenStore: failed to persist token", key, error);
        });
    },
    remove(key: string): void {
      assertHydrated("remove");
      cache.delete(key);
      void SecureStore.deleteItemAsync(sanitizeKey(prefix, key))
        .then(persistIndex)
        .catch((error: unknown) => {
          console.error("SecureTokenStore: failed to remove token", key, error);
        });
    },
    clear(): void {
      assertHydrated("clear");
      const keys = [...cache.keys()];
      cache.clear();
      void Promise.all(
        keys.map((key) => SecureStore.deleteItemAsync(sanitizeKey(prefix, key))),
      )
        .then(persistIndex)
        .catch((error: unknown) => {
          console.error("SecureTokenStore: failed to clear tokens", error);
        });
    },
  };
}
