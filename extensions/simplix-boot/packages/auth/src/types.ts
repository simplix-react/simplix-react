import type { FetchFn } from "@simplix-react/contract";

/**
 * Raw token response from Spring Security auth endpoints.
 *
 * @example
 * ```ts
 * const response: SpringTokenResponse = {
 *   accessToken: "eyJhbGci...",
 *   refreshToken: "dGhpcyBp...",
 *   accessTokenExpiry: "2026-02-20T01:00:00Z",
 *   refreshTokenExpiry: "2026-02-27T00:00:00Z",
 * };
 * ```
 */
export interface SpringTokenResponse {
  accessToken: string;
  refreshToken: string;
  /** ISO 8601 date-time string for access token expiry. */
  accessTokenExpiry: string;
  /** ISO 8601 date-time string for refresh token expiry. */
  refreshTokenExpiry: string;
}

/**
 * User information returned by Spring Security user-info endpoint.
 *
 * @example
 * ```ts
 * const user: SpringUser = {
 *   userId: "user-1",
 *   username: "john",
 *   displayName: "John Doe",
 *   roles: ["ROLE_USER", { roleCode: "ROLE_ADMIN", roleName: "Admin" }],
 * };
 * ```
 */
export interface SpringUser {
  userId: string;
  username: string;
  displayName?: string;
  email?: string;
  roles: Array<string | { roleCode: string; roleName: string }>;
  isSuperAdmin?: boolean | string;
}

/**
 * Configuration for {@link createSpringAuthConfig}.
 *
 * @example
 * ```ts
 * const options: SpringAuthOptions = {
 *   loginEndpoint: "/api/v1/auth/token/issue",
 *   fetchFn: customFetch,
 * };
 * ```
 */
export interface SpringAuthOptions {
  /** Login endpoint for Basic Auth token issuance. Defaults to `"/api/v1/auth/token/issue"`. */
  loginEndpoint?: string;
  /** Token refresh endpoint. Defaults to `"/api/v1/auth/token/refresh"`. */
  refreshEndpoint?: string;
  /** Token revocation endpoint. Defaults to `"/api/v1/auth/token/revoke"`. */
  revokeEndpoint?: string;
  /** User info endpoint. Defaults to `"/api/v1/user/me"`. */
  userInfoEndpoint?: string;
  /** Custom fetch function. Defaults to `defaultFetch` from `@simplix-react/contract`. */
  fetchFn?: FetchFn;
}
