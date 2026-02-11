import type { TokenStore } from "../types.js";

/**
 * Creates a {@link TokenStore} backed by `localStorage`.
 *
 * All keys are automatically prefixed to avoid collisions.
 * Tokens persist across browser sessions until explicitly cleared.
 *
 * @param prefix - Key prefix. Defaults to `"auth:"`.
 *
 * @example
 * ```ts
 * const store = localStorageStore("myapp:");
 * store.set("access_token", "abc");
 * // localStorage key: "myapp:access_token"
 * ```
 */
export function localStorageStore(prefix = "auth:"): TokenStore {
  return {
    get: (key) => localStorage.getItem(`${prefix}${key}`),
    set: (key, value) => localStorage.setItem(`${prefix}${key}`, value),
    remove: (key) => localStorage.removeItem(`${prefix}${key}`),
    clear: () => {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
    },
  };
}
