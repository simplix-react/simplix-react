import type { TokenStore } from "../types.js";

/**
 * Creates an in-memory {@link TokenStore}.
 *
 * Tokens are stored in a `Map` and lost when the process exits.
 * Suitable for testing and short-lived sessions.
 *
 * @example
 * ```ts
 * const store = memoryStore();
 * store.set("access_token", "abc123");
 * store.get("access_token"); // "abc123"
 * ```
 */
export function memoryStore(): TokenStore {
  const data = new Map<string, string>();

  return {
    get: (key) => data.get(key) ?? null,
    set: (key, value) => data.set(key, value),
    remove: (key) => data.delete(key),
    clear: () => data.clear(),
  };
}
