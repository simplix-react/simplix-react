/** Input type that accepts both string roles and Spring Security role objects. */
export type RoleInput =
  | string
  | { roleCode?: string; roleName?: string; name?: string };

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
 * import { normalizeRoles } from "@simplix-react-ext/simplix-boot-access";
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
