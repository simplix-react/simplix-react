import type { TokenStore } from "../types.js";

/**
 * Creates a {@link TokenStore} backed by `sessionStorage`.
 *
 * All keys are automatically prefixed to avoid collisions.
 * Tokens persist only for the current browser tab/session.
 *
 * @param prefix - Key prefix. Defaults to `"auth:"`.
 *
 * @example
 * ```ts
 * const store = sessionStorageStore("myapp:");
 * store.set("access_token", "abc");
 * // sessionStorage key: "myapp:access_token"
 * ```
 */
export function sessionStorageStore(prefix = "auth:"): TokenStore {
  return {
    get: (key) => sessionStorage.getItem(`${prefix}${key}`),
    set: (key, value) => sessionStorage.setItem(`${prefix}${key}`, value),
    remove: (key) => sessionStorage.removeItem(`${prefix}${key}`),
    clear: () => {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      for (const key of keysToRemove) {
        sessionStorage.removeItem(key);
      }
    },
  };
}
