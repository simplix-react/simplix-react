import { normalizePermissionMap, normalizeRoles } from "@simplix-react/access";

import type { SpringConvertResult, SpringPermissionsResponse } from "./types.js";

/**
 * Converts a Spring Security permissions response into CASL rules.
 *
 * @remarks
 * Uses {@link normalizePermissionMap} to convert the permission map and
 * {@link normalizeRoles} to handle mixed string/object role arrays.
 * When `isSuperAdmin` is true, a `{ action: "manage", subject: "all" }` rule
 * is prepended to grant full access.
 *
 * @param response - The Spring Security permissions response.
 * @returns An object containing CASL rules, normalized roles, and super-admin flag.
 *
 * @example
 * ```ts
 * import { convertSpringPermissionsToCasl } from "@simplix-boot/access";
 *
 * const result = convertSpringPermissionsToCasl({
 *   permissions: { Pet: ["list", "view"] },
 *   roles: ["ROLE_USER"],
 *   isSuperAdmin: false,
 * });
 * // result.rules → [{ action: "list", subject: "Pet" }, { action: "view", subject: "Pet" }]
 * ```
 */
export function convertSpringPermissionsToCasl(
  response: SpringPermissionsResponse,
): SpringConvertResult {
  const rules = normalizePermissionMap(response.permissions);
  const roles = normalizeRoles(response.roles);
  const isSuperAdmin =
    response.isSuperAdmin === true || response.isSuperAdmin === "true";

  if (isSuperAdmin) {
    rules.unshift({ action: "manage", subject: "all" });
  }

  return { rules, roles, isSuperAdmin };
}
