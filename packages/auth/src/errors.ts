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
 * Why a sign-in could not be finished, carried by a `SIGN_IN_FAILED` {@link AuthError}.
 *
 * - `issuer-error` - the issuer sent the browser back with an `error` parameter; `issuerError` says which.
 * - `not-pending` - the response answers no sign-in this storage started: another tab's (a mailed link
 *   opened in a new tab), or one already finished. The issuer may still hold a session, so starting
 *   a sign-in again here usually succeeds without a prompt.
 * - `malformed-response` - the response answers the pending sign-in but carries no code.
 * - `token-refused` - the issuer refused the code exchange; `issuerError` says why when it answered.
 */
export type SignInFailure = "issuer-error" | "not-pending" | "malformed-response" | "token-refused";

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

  /** Why a sign-in could not be finished; set on `SIGN_IN_FAILED` from the OIDC client only. */
  readonly signInFailure?: SignInFailure;

  constructor(
    /** Typed error code for programmatic handling. */
    public readonly code: AuthErrorCode,
    message: string,
    /** Original error that caused this failure, the issuer's refusal when there was one, and why a sign-in failed. */
    options?: { cause?: unknown; issuerError?: { error: string; description?: string }; signInFailure?: SignInFailure },
  ) {
    super(message, options);
    this.issuerError = options?.issuerError;
    this.signInFailure = options?.signInFailure;
  }
}
