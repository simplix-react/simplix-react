/**
 * Discriminated error codes for auth-related failures.
 */
export type AuthErrorCode =
  | "TOKEN_EXPIRED"
  | "REFRESH_FAILED"
  | "UNAUTHENTICATED"
  | "SCHEME_ERROR";

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

  constructor(
    /** Typed error code for programmatic handling. */
    public readonly code: AuthErrorCode,
    message: string,
    /** Original error that caused this failure. */
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}
