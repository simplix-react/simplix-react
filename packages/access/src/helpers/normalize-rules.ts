import type { AccessRule } from "../types.js";

/**
 * Widens {@link AccessRule} to accept arbitrary string actions/subjects.
 *
 * Normalize helpers parse raw strings at runtime, so action/subject types
 * cannot be statically narrowed. Consumers cast the result when assigning
 * to a typed `AccessRule<TActions, TSubjects>`.
 */
type WideRule = AccessRule<string, string>;

/**
 * Converts a {@link PermissionMap} into an array of CASL rules.
 *
 * @param permissions - Map of resource names to their allowed action arrays.
 * @returns An array of CASL rules with `action` and `subject` fields.
 *
 * @example
 * ```ts
 * import { normalizePermissionMap } from "@simplix-react/access";
 *
 * normalizePermissionMap({ Pet: ["list", "view"] });
 * // → [{ action: "list", subject: "Pet" }, { action: "view", subject: "Pet" }]
 * ```
 */
export function normalizePermissionMap(
  permissions: Record<string, string[]>,
): WideRule[] {
  const rules: WideRule[] = [];
  for (const [resource, actions] of Object.entries(permissions)) {
    for (const action of actions) {
      rules.push({ action, subject: resource });
    }
  }
  return rules;
}

/**
 * Converts flat permission strings like `"PET:list"` into CASL rules.
 *
 * @remarks
 * If a string has no separator, it is treated as a subject with `"manage"` action
 * (e.g., `"ROLE_ADMIN"` becomes `{ action: "manage", subject: "ROLE_ADMIN" }`).
 *
 * @param permissions - Array of permission strings (e.g., `["PET:list", "PET:view"]`).
 * @param separator - Delimiter between subject and action. Defaults to `":"`.
 * @returns An array of CASL rules.
 *
 * @example
 * ```ts
 * import { normalizeFlatPermissions } from "@simplix-react/access";
 *
 * normalizeFlatPermissions(["PET:list", "PET:view"]);
 * // → [{ action: "list", subject: "PET" }, { action: "view", subject: "PET" }]
 * ```
 */
export function normalizeFlatPermissions(
  permissions: string[],
  separator = ":",
): WideRule[] {
  const rules: WideRule[] = [];
  for (const perm of permissions) {
    const sepIdx = perm.indexOf(separator);
    if (sepIdx === -1) {
      rules.push({ action: "manage", subject: perm });
    } else {
      const subject = perm.slice(0, sepIdx);
      const action = perm.slice(sepIdx + 1);
      rules.push({ action, subject });
    }
  }
  return rules;
}

/**
 * Converts an OAuth2-style scope string into CASL rules.
 *
 * @param scopes - Space-delimited scope string (e.g., `"pet:read pet:write"`).
 * @param separator - Delimiter within each scope. Defaults to `":"`.
 * @returns An array of CASL rules.
 *
 * @example
 * ```ts
 * import { normalizeScopePermissions } from "@simplix-react/access";
 *
 * normalizeScopePermissions("pet:read pet:write");
 * // → [{ action: "read", subject: "pet" }, { action: "write", subject: "pet" }]
 * ```
 */
export function normalizeScopePermissions(
  scopes: string,
  separator = ":",
): WideRule[] {
  return normalizeFlatPermissions(
    scopes.split(/\s+/).filter(Boolean),
    separator,
  );
}
