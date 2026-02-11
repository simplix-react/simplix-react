import type { AuthScheme, OAuth2SchemeOptions, TokenPair } from "../types.js";
import { AuthError } from "../errors.js";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const EXPIRES_AT_KEY = "expires_at";

/**
 * Creates an OAuth2 refresh_token grant {@link AuthScheme}.
 *
 * Attaches a Bearer token to requests and refreshes it via the
 * standard OAuth2 `refresh_token` grant when expired.
 *
 * @example
 * ```ts
 * const store = localStorageStore("myapp:");
 * const scheme = oauth2Scheme({
 *   store,
 *   tokenEndpoint: "https://auth.example.com/oauth/token",
 *   clientId: "my-client-id",
 *   scopes: ["read", "write"],
 * });
 * ```
 */
export function oauth2Scheme(options: OAuth2SchemeOptions): AuthScheme {
  const { store, tokenEndpoint, clientId, clientSecret, scopes } = options;

  function storeTokenPair(pair: TokenPair): void {
    store.set(ACCESS_TOKEN_KEY, pair.accessToken);

    if (pair.refreshToken) {
      store.set(REFRESH_TOKEN_KEY, pair.refreshToken);
    }

    if (pair.expiresIn) {
      const expiresAt = Date.now() + pair.expiresIn * 1000;
      store.set(EXPIRES_AT_KEY, String(expiresAt));
    }
  }

  return {
    name: "oauth2",

    async getHeaders() {
      const token = store.get(ACCESS_TOKEN_KEY);
      if (!token) return Object.create(null) as Record<string, string>;

      return { Authorization: `Bearer ${token}` };
    },

    async refresh() {
      const refreshToken = store.get(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        throw new AuthError(
          "REFRESH_FAILED",
          "No refresh token available for OAuth2 scheme",
        );
      }

      const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        ...options.tokenEndpointBody,
      });

      if (clientSecret) {
        body.set("client_secret", clientSecret);
      }

      if (scopes?.length) {
        body.set("scope", scopes.join(" "));
      }

      const response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          ...options.tokenEndpointHeaders,
        },
        body,
      });

      if (!response.ok) {
        throw new AuthError(
          "REFRESH_FAILED",
          `OAuth2 token refresh failed: ${response.status}`,
        );
      }

      const data = await response.json();

      storeTokenPair({
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? refreshToken,
        expiresIn: data.expires_in,
      });
    },

    isAuthenticated() {
      return store.get(ACCESS_TOKEN_KEY) !== null;
    },

    clear() {
      store.remove(ACCESS_TOKEN_KEY);
      store.remove(REFRESH_TOKEN_KEY);
      store.remove(EXPIRES_AT_KEY);
    },
  };
}
