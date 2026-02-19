import type { AccessPolicy } from "../types.js";
import { AccessDeniedError } from "../errors.js";

/**
 * Options for {@link requireAccess}.
 *
 * @example
 * ```ts
 * const options: RouteGuardOptions = {
 *   action: "view",
 *   subject: "BACKOFFICE_ACCESS",
 *   storageFallback: {
 *     key: "simplix-access",
 *     check: (stored) => Array.isArray((stored as any)?.rules),
 *   },
 * };
 * ```
 */
export interface RouteGuardOptions {
  /** The action to require (e.g., "list", "view"). */
  action: string;
  /** The subject to require access to (e.g., "BACKOFFICE_ACCESS"). */
  subject: string;
  /**
   * Fallback storage check for when the policy has not yet rehydrated.
   *
   * If provided, reads the specified key from `localStorage` and passes
   * the parsed value to `check`. Returns silently if `check` returns `true`.
   */
  storageFallback?: {
    key: string;
    check: (stored: unknown) => boolean;
  };
}

/**
 * Checks if the current policy allows the specified action on the subject.
 *
 * @remarks
 * Intended for use in TanStack Router `beforeLoad` guards.
 * When the policy has not yet rehydrated (e.g., during initial navigation),
 * use `storageFallback` to check persisted state directly from `localStorage`.
 *
 * @param policy - The {@link AccessPolicy} to check against.
 * @param options - Guard configuration including action, subject, and optional fallback.
 * @throws {@link AccessDeniedError} if the permission check fails.
 *
 * @example
 * ```ts
 * import { requireAccess } from "@simplix-react/access/react";
 *
 * export const Route = createFileRoute("/admin")({
 *   beforeLoad: () => {
 *     requireAccess(policy, {
 *       action: "view",
 *       subject: "BACKOFFICE_ACCESS",
 *     });
 *   },
 * });
 * ```
 *
 * @see {@link RouteGuardOptions} for configuration details.
 * @see {@link AccessDeniedError} for the thrown error type.
 */
export function requireAccess(
  policy: AccessPolicy<string, string>,
  options: RouteGuardOptions,
): void {
  const { action, subject, storageFallback } = options;

  if (policy.can(action, subject)) {
    return;
  }

  // Fallback: check storage when policy is not yet rehydrated
  if (storageFallback) {
    try {
      const raw = globalThis.localStorage?.getItem(storageFallback.key);
      if (raw != null) {
        const parsed: unknown = JSON.parse(raw);
        if (storageFallback.check(parsed)) {
          return;
        }
      }
    } catch {
      // Storage unavailable or corrupt — fall through to deny
    }
  }

  throw new AccessDeniedError(action, subject);
}
