import type { AccessAdapter, AccessExtractResult } from "@simplix-react/access";
import { defaultFetch } from "@simplix-react/contract";

import { convertSpringPermissionsToCasl } from "./convert-permissions.js";
import type {
  SpringAccessAdapterOptions,
  SpringPermissionsResponse,
} from "./types.js";

const DEFAULT_PERMISSIONS_ENDPOINT = "/api/v1/user/me/permissions";
const DEFAULT_PUBLIC_PERMISSIONS_ENDPOINT =
  "/api/v1/public/user/permissions";
const DEFAULT_SYSTEM_ADMIN_ROLE = "ROLE_SYSTEM_ADMIN";

/**
 * Creates an {@link AccessAdapter} for Spring Security permission endpoints.
 *
 * @remarks
 * The adapter fetches permissions from the configured endpoint, converts
 * the Spring Security response format into CASL rules, and determines
 * super-admin status from roles.
 *
 * @param options - Adapter configuration.
 * @returns An {@link AccessAdapter} compatible with `@simplix-react/access`.
 *
 * @example
 * ```ts
 * import { createSpringAccessAdapter } from "@simplix-boot/access";
 *
 * const adapter = createSpringAccessAdapter({
 *   permissionsEndpoint: "/api/v1/user/me/permissions",
 *   fetchFn: auth.fetchFn,
 * });
 * ```
 */
export function createSpringAccessAdapter(
  options: SpringAccessAdapterOptions = {},
): AccessAdapter {
  const {
    permissionsEndpoint = DEFAULT_PERMISSIONS_ENDPOINT,
    publicPermissionsEndpoint = DEFAULT_PUBLIC_PERMISSIONS_ENDPOINT,
    systemAdminRole = DEFAULT_SYSTEM_ADMIN_ROLE,
    fetchFn = defaultFetch,
  } = options;

  return {
    async extract(authData: unknown): Promise<AccessExtractResult> {
      const isPublic = authData === null || authData === undefined;
      const endpoint = isPublic
        ? publicPermissionsEndpoint
        : permissionsEndpoint;

      const raw = await fetchFn<SpringPermissionsResponse>(endpoint);
      const response: SpringPermissionsResponse = {
        permissions: raw.permissions ?? {},
        roles: raw.roles ?? [],
        isSuperAdmin: raw.isSuperAdmin ?? false,
      };

      const { rules, roles, isSuperAdmin } =
        convertSpringPermissionsToCasl(response);

      // Also check if systemAdminRole is present in roles
      const hasSuperAdminRole = roles.some(
        (r) => r === systemAdminRole,
      );
      const effectiveSuperAdmin = isSuperAdmin || hasSuperAdminRole;

      if (hasSuperAdminRole && !isSuperAdmin) {
        // Ensure manage-all rule is present when role-based super admin
        const hasManageAll = rules.some(
          (r) => r.action === "manage" && r.subject === "all",
        );
        if (!hasManageAll) {
          rules.unshift({ action: "manage", subject: "all" });
        }
      }

      return {
        rules,
        roles,
        user: {
          userId: "",
          username: "",
          roles,
          isSuperAdmin: effectiveSuperAdmin,
        },
      };
    },
  };
}
