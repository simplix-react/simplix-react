/** Input type that accepts both string roles and Spring Security role objects. */
export type RoleInput =
  | string
  | { roleCode?: string; roleName?: string; name?: string };

const ROLE_PREFIX = "ROLE_";

/**
 * Normalizes an array of mixed role inputs into plain role strings.
 *
 * @remarks
 * Handles Spring Security role objects (`{ roleCode, roleName, name }`)
 * and plain strings. Empty or unresolvable entries are filtered out.
 *
 * @param roles - Array of string roles or role objects.
 * @returns Array of plain role code strings.
 *
 * @example
 * ```ts
 * import { normalizeRoles } from "@simplix-react/access";
 *
 * normalizeRoles(["ADMIN", { roleCode: "USER" }]); // ["ADMIN", "USER"]
 * ```
 */
export function normalizeRoles(roles: RoleInput[]): string[] {
  return roles
    .map((role) => {
      if (typeof role === "string") return role;
      const code = role.roleCode ?? role.roleName ?? role.name;
      if (!code) return "";
      return code;
    })
    .filter(Boolean);
}

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
