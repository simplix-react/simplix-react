import type { TokenStore } from "../types.js";

/**
 * Creates a {@link TokenStore} backed by a Web Storage API (`localStorage` or `sessionStorage`).
 *
 * All keys are automatically prefixed to avoid collisions.
 *
 * @param storage - The underlying `Storage` instance (`localStorage` or `sessionStorage`).
 * @param prefix - Key prefix. Defaults to `"auth:"`.
 *
 * @example
 * ```ts
 * const store = createWebStorageStore(localStorage, "myapp:");
 * store.set("access_token", "abc");
 * // localStorage key: "myapp:access_token"
 * ```
 */
export function createWebStorageStore(storage: Storage, prefix = "auth:"): TokenStore {
  return {
    get: (key) => storage.getItem(`${prefix}${key}`),
    set: (key, value) => storage.setItem(`${prefix}${key}`, value),
    remove: (key) => storage.removeItem(`${prefix}${key}`),
    clear: () => {
      const keysToRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      for (const key of keysToRemove) {
        storage.removeItem(key);
      }
    },
  };
}
