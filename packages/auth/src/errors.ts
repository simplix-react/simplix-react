/**
 * Discriminated error codes for auth-related failures.
 */
export type AuthErrorCode =
  | "TOKEN_EXPIRED"
  | "REFRESH_FAILED"
  | "UNAUTHENTICATED"
  | "SCHEME_ERROR"
  | "SIGN_IN_FAILED";

/**
 * Error thrown by auth operations.
 *
 * Extends the native `Error` with a typed {@link AuthErrorCode} for
 * programmatic error handling.
 *
 * @example
 * ```ts
 * try {
 *   await auth.fetchFn("/api/data");
 * } catch (error) {
 *   if (error instanceof AuthError && error.code === "REFRESH_FAILED") {
 *     redirectToLogin();
 *   }
 * }
 * ```
 */
export class AuthError extends Error {
  readonly name = "AuthError";

  /**
   * What the issuer said when it refused a token request, as RFC 6749 § 5.2 spells it: `error`
   * (`invalid_grant`) and `error_description`, the issuer's own words for why. Absent when the
   * failure was not an issuer's answer, or the answer carried no error body.
   */
  readonly issuerError?: { readonly error: string; readonly description?: string };

  constructor(
    /** Typed error code for programmatic handling. */
    public readonly code: AuthErrorCode,
    message: string,
    /** Original error that caused this failure, and the issuer's refusal when there was one. */
    options?: { cause?: unknown; issuerError?: { error: string; description?: string } },
  ) {
    super(message, options);
    this.issuerError = options?.issuerError;
  }
}
