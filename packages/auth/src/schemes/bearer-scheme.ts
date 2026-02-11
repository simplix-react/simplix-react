import type { AuthScheme, BearerSchemeOptions } from "../types.js";
import { AuthError } from "../errors.js";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, EXPIRES_AT_KEY, storeTokenPair } from "../helpers/token-storage.js";

/**
 * Creates a Bearer token {@link AuthScheme}.
 *
 * Attaches an `Authorization: Bearer <token>` header to each request.
 * Optionally supports proactive token refresh before expiry.
 *
 * @example
 * ```ts
 * const store = localStorageStore("myapp:");
 * const scheme = bearerScheme({
 *   store,
 *   token: () => store.get("access_token"),
 *   refresh: {
 *     refreshFn: async () => {
 *       const res = await fetch("/auth/refresh", { method: "POST" });
 *       return res.json();
 *     },
 *   },
 * });
 * ```
 */
export function bearerScheme(options: BearerSchemeOptions): AuthScheme {
  const { store, token, refresh } = options;

  function resolveToken(): string | null {
    if (typeof token === "function") {
      return token();
    }
    return token;
  }

  function isExpiringSoon(): boolean {
    if (!refresh?.refreshBeforeExpiry) return false;

    const expiresAt = store.get(EXPIRES_AT_KEY);
    if (!expiresAt) return false;

    const expiresAtMs = Number(expiresAt);
    const bufferMs = refresh.refreshBeforeExpiry * 1000;

    return Date.now() >= expiresAtMs - bufferMs;
  }

  return {
    name: "bearer",

    async getHeaders() {
      if (refresh && isExpiringSoon()) {
        try {
          const pair = await refresh.refreshFn();
          storeTokenPair(store, pair);
        } catch {
          // Proactive refresh failed; proceed with current token
        }
      }

      const currentToken = resolveToken();
      if (!currentToken) return Object.create(null) as Record<string, string>;

      return { Authorization: `Bearer ${currentToken}` };
    },

    async refresh() {
      if (!refresh) {
        throw new AuthError(
          "REFRESH_FAILED",
          "Bearer scheme has no refresh configuration",
        );
      }

      const pair = await refresh.refreshFn();
      storeTokenPair(store, pair);
    },

    isAuthenticated() {
      return resolveToken() !== null;
    },

    clear() {
      store.remove(ACCESS_TOKEN_KEY);
      store.remove(REFRESH_TOKEN_KEY);
      store.remove(EXPIRES_AT_KEY);
    },
  };
}
