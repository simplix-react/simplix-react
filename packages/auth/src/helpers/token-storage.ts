import type { TokenPair, TokenStore } from "../types.js";

export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const EXPIRES_AT_KEY = "expires_at";

/**
 * Stores an access/refresh token pair and optional expiry into the given store.
 *
 * @param store - The token store to write to.
 * @param pair - The token pair to persist.
 */
export function storeTokenPair(store: TokenStore, pair: TokenPair): void {
  store.set(ACCESS_TOKEN_KEY, pair.accessToken);

  if (pair.refreshToken) {
    store.set(REFRESH_TOKEN_KEY, pair.refreshToken);
  }

  if (pair.expiresIn) {
    const expiresAt = Date.now() + pair.expiresIn * 1000;
    store.set(EXPIRES_AT_KEY, String(expiresAt));
  }
}
