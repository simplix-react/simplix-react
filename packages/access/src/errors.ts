/**
 * Thrown when an access check fails.
 *
 * @remarks
 * Used by `requireAccess` in route guards. Catch this error
 * in TanStack Router's `onError` or a global error boundary to
 * redirect unauthorized users.
 *
 * @example
 * ```ts
 * import { AccessDeniedError } from "@simplix-react/access";
 *
 * try {
 *   requireAccess(policy, { action: "delete", subject: "Pet" });
 * } catch (error) {
 *   if (error instanceof AccessDeniedError) {
 *     console.log(error.action);  // "delete"
 *     console.log(error.subject); // "Pet"
 *   }
 * }
 * ```
 */
export class AccessDeniedError extends Error {
  /** The action that was denied. */
  readonly action: string;
  /** The subject the action was attempted on. */
  readonly subject: string;

  /**
   * @param action - The action that was denied.
   * @param subject - The subject the action was attempted on.
   */
  constructor(action: string, subject: string) {
    super(`Access denied: cannot "${action}" on "${subject}"`);
    this.name = "AccessDeniedError";
    this.action = action;
    this.subject = subject;
  }
}
