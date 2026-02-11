import type { AuthConfig, AuthInstance, TokenPair } from "./types.js";
import { createAuthFetch } from "./create-auth-fetch.js";

/**
 * Creates a reactive {@link AuthInstance} with state management and subscriptions.
 *
 * Provides an authenticated `fetchFn` for `defineApi`, plus methods to manage
 * tokens and subscribe to auth state changes.
 *
 * @example
 * ```ts
 * const store = localStorageStore("myapp:");
 * const auth = createAuth({
 *   schemes: [
 *     bearerScheme({
 *       store,
 *       token: () => store.get("access_token"),
 *       refresh: { refreshFn: myRefreshFn },
 *     }),
 *   ],
 *   store,
 *   onRefreshFailure: () => (location.href = "/login"),
 * });
 *
 * const api = defineApi(config, { fetchFn: auth.fetchFn });
 *
 * // Subscribe to auth changes
 * auth.subscribe(() => {
 *   console.log("Authenticated:", auth.isAuthenticated());
 * });
 * ```
 */
export function createAuth(config: AuthConfig): AuthInstance {
  const { schemes, store } = config;
  const listeners = new Set<() => void>();

  function notify(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  const fetchFn = createAuthFetch(config);

  return {
    fetchFn,

    isAuthenticated() {
      return schemes.some((s) => s.isAuthenticated());
    },

    getAccessToken() {
      return store?.get("access_token") ?? null;
    },

    setTokens(tokens: TokenPair) {
      if (store) {
        store.set("access_token", tokens.accessToken);

        if (tokens.refreshToken) {
          store.set("refresh_token", tokens.refreshToken);
        }

        if (tokens.expiresIn) {
          const expiresAt = Date.now() + tokens.expiresIn * 1000;
          store.set("expires_at", String(expiresAt));
        }
      }

      notify();
    },

    clear() {
      for (const scheme of schemes) {
        scheme.clear();
      }

      store?.clear();
      notify();
    },

    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
