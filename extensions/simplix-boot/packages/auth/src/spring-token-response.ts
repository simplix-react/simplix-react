import type { TokenPair } from "@simplix-react/auth";

import type { SpringTokenResponse } from "./types.js";

/**
 * Converts a Spring Security token response into a simplix-react {@link TokenPair}.
 *
 * @remarks
 * Maps `accessTokenExpiry` to {@link TokenPair.expiresAt} and
 * `refreshTokenExpiry` to {@link TokenPair.refreshTokenExpiresAt},
 * preserving the ISO 8601 string format.
 *
 * @param response - The raw Spring Security token response.
 * @returns A {@link TokenPair} compatible with `@simplix-react/auth`.
 *
 * @example
 * ```ts
 * import { parseSpringTokenResponse } from "@simplix-boot/auth";
 *
 * const tokenPair = parseSpringTokenResponse({
 *   accessToken: "eyJhbGci...",
 *   refreshToken: "dGhpcyBp...",
 *   accessTokenExpiry: "2026-02-20T01:00:00Z",
 *   refreshTokenExpiry: "2026-02-27T00:00:00Z",
 * });
 * // tokenPair.expiresAt === "2026-02-20T01:00:00Z"
 * ```
 */
export function parseSpringTokenResponse(
  response: SpringTokenResponse,
): TokenPair {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAt: response.accessTokenExpiry,
    refreshTokenExpiresAt: response.refreshTokenExpiry,
  };
}
