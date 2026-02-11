import type { AuthScheme, CustomSchemeOptions } from "../types.js";

/**
 * Creates a user-defined {@link AuthScheme} from callback functions.
 *
 * Use this when the built-in schemes don't cover your auth flow
 * (e.g., JWE tokens, form-based auth, HMAC signing).
 *
 * @example
 * ```ts
 * const jweAuth = customScheme({
 *   name: "jwe",
 *   getHeaders: async () => ({
 *     Authorization: `Bearer ${await decryptJwe(getStoredJwe())}`,
 *   }),
 *   refresh: async () => {
 *     const res = await fetch("/auth/token", { method: "POST" });
 *     storeTokens(await res.json());
 *   },
 *   isAuthenticated: () => !!getStoredJwe(),
 *   clear: () => clearStorage(),
 * });
 * ```
 */
export function customScheme(options: CustomSchemeOptions): AuthScheme {
  return {
    name: options.name,
    getHeaders: options.getHeaders,
    refresh: options.refresh,
    isAuthenticated: options.isAuthenticated,
    clear: options.clear,
  };
}
