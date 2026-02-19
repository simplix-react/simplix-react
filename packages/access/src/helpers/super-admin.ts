import type { AccessRule, AccessUser } from "../types.js";

/**
 * Creates a CASL rule granting full access (`manage` on `all`).
 *
 * @returns An array containing a single `{ action: "manage", subject: "all" }` rule.
 */
export function createSuperAdminRules(): AccessRule[] {
  return [{ action: "manage", subject: "all" }];
}

/**
 * Determines if a user is a super admin.
 *
 * @remarks
 * Uses the custom checker if provided, otherwise falls back
 * to the `user.isSuperAdmin` flag.
 *
 * @param user - The user to check.
 * @param checker - Optional custom super-admin check function.
 * @returns `true` if the user is a super admin.
 */
export function checkSuperAdmin(
  user: AccessUser,
  checker?: (user: AccessUser) => boolean,
): boolean {
  if (checker) return checker(user);
  return user.isSuperAdmin === true || (user.isSuperAdmin as unknown) === "true";
}
