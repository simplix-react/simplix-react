const ROLE_PREFIX = "ROLE_";

/**
 * Ensures a role string has the `ROLE_` prefix.
 *
 * @param role - Role name with or without the `ROLE_` prefix.
 * @returns The role string with `ROLE_` prefix guaranteed.
 *
 * @example
 * ```ts
 * import { normalizeRole } from "@simplix-react/access";
 *
 * normalizeRole("ADMIN");      // "ROLE_ADMIN"
 * normalizeRole("ROLE_ADMIN"); // "ROLE_ADMIN"
 * ```
 */
export function normalizeRole(role: string): string {
  return role.startsWith(ROLE_PREFIX) ? role : `${ROLE_PREFIX}${role}`;
}

/**
 * Checks if a role exists in the given role list.
 *
 * @remarks
 * Comparison is prefix-insensitive: `"ADMIN"` matches `"ROLE_ADMIN"`.
 *
 * @param roles - The user's current role list.
 * @param role - The role to search for (with or without `ROLE_` prefix).
 * @returns `true` if the role is found.
 */
export function hasRole(roles: string[], role: string): boolean {
  const normalized = normalizeRole(role);
  return roles.some((r) => normalizeRole(r) === normalized);
}

/**
 * Checks if any of the target roles exist in the given role list.
 *
 * @param roles - The user's current role list.
 * @param targetRoles - Roles to check (with or without `ROLE_` prefix).
 * @returns `true` if at least one target role is found.
 */
export function hasAnyRole(roles: string[], targetRoles: string[]): boolean {
  return targetRoles.some((role) => hasRole(roles, role));
}
