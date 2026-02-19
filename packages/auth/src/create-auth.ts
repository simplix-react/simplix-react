import type { AuthConfig, AuthInstance, TokenPair } from "./types.js";
import { createAuthFetch } from "./create-auth-fetch.js";
import { storeTokenPair, ACCESS_TOKEN_KEY } from "./helpers/token-storage.js";

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
  let user: unknown = null;

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
      return store?.get(ACCESS_TOKEN_KEY) ?? null;
    },

    setTokens(tokens: TokenPair) {
      if (store) {
        storeTokenPair(store, tokens);
      }

      notify();
    },

    clear() {
      for (const scheme of schemes) {
        scheme.clear();
      }

      store?.clear();
      user = null;
      notify();
    },

    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async rehydrate() {
      const accessToken = store?.get(ACCESS_TOKEN_KEY) ?? null;
      if (!accessToken) {
        notify();
        return;
      }

      if (config.onRehydrate) {
        const valid = await config.onRehydrate(accessToken);
        if (!valid) {
          for (const scheme of schemes) {
            scheme.clear();
          }
          store?.clear();
          user = null;
        }
      }

      notify();
    },

    getUser<TUser = unknown>(): TUser | null {
      return user as TUser | null;
    },

    setUser<TUser = unknown>(newUser: TUser | null): void {
      user = newUser;
      notify();
    },
  };
}
