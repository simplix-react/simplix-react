import type { AccessRule } from "@simplix-react/access";

const DEFAULT_RESOURCE = "BACKOFFICE_ACCESS";

/**
 * Checks whether the given rules grant backoffice access.
 *
 * @remarks
 * Returns `true` if `isSuperAdmin` is `true`, or if any rule grants
 * an action on the specified resource (or `"all"` subjects).
 *
 * @param rules - CASL rules to check.
 * @param isSuperAdmin - Whether the user is a super admin. Defaults to `false`.
 * @param resource - The resource name to check. Defaults to `"BACKOFFICE_ACCESS"`.
 * @returns `true` if backoffice access is granted.
 *
 * @example
 * ```ts
 * import { hasBackofficeAccess } from "@simplix-boot/access";
 *
 * hasBackofficeAccess(rules, true);  // true (super admin)
 * hasBackofficeAccess(rules, false); // checks rules for BACKOFFICE_ACCESS
 * ```
 */
export function hasBackofficeAccess(
  rules: AccessRule<string, string>[],
  isSuperAdmin = false,
  resource = DEFAULT_RESOURCE,
): boolean {
  if (isSuperAdmin) return true;

  return rules.some(
    (rule) =>
      rule.subject === resource ||
      rule.subject === "all",
  );
}
