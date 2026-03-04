import type { AuthScheme, OAuth2SchemeOptions } from "../types.js";
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
export declare function oauth2Scheme(options: OAuth2SchemeOptions): AuthScheme;
//# sourceMappingURL=oauth2-scheme.d.ts.map