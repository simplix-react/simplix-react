import type { AccessRule } from "@simplix-react/access";
import type { OrvalMutator } from "@simplix-react/api";

/**
 * Response shape returned by Spring Security permission endpoints.
 *
 * @example
 * ```ts
 * const response: SpringPermissionsResponse = {
 *   permissions: { Pet: ["list", "view"], Order: ["list"] },
 *   roles: ["ROLE_USER", { roleCode: "ROLE_ADMIN", roleName: "Admin" }],
 *   isSuperAdmin: false,
 * };
 * ```
 */
export interface SpringPermissionsResponse {
  /** Map of resource names to their allowed action arrays. */
  permissions: Record<string, string[]>;
  /** Roles as plain strings or Spring Security role objects. */
  roles: Array<string | { roleCode: string; roleName: string }>;
  /** Whether the user has super-admin privileges. Accepts boolean or string `"true"`. */
  isSuperAdmin: boolean | string;
}

/**
 * Configuration for {@link createSpringAccessAdapter}.
 *
 * @example
 * ```ts
 * const options: SpringAccessAdapterOptions = {
 *   permissionsEndpoint: "/api/v1/user/me/permissions",
 *   fetchFn: auth.fetchFn,
 * };
 * ```
 */
export interface SpringAccessAdapterOptions {
  /** Authenticated permissions endpoint. Defaults to `"/api/v1/user/me/permissions"`. */
  permissionsEndpoint?: string;
  /** Public permissions endpoint. Defaults to `"/api/v1/public/user/permissions"`. */
  publicPermissionsEndpoint?: string;
  /** Role code that identifies a system admin. Defaults to `"ROLE_SYSTEM_ADMIN"`. */
  systemAdminRole?: string;
  /** Custom fetch function. Required. */
  fetchFn?: OrvalMutator;
}

/** Result of converting Spring permissions, including rules and metadata. */
export interface SpringConvertResult {
  rules: AccessRule<string, string>[];
  roles: string[];
  isSuperAdmin: boolean;
}
