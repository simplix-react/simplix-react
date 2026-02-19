import type {
  AccessAdapter,
  AccessExtractResult,
  AccessUser,
  PermissionMap,
} from "../types.js";
import { normalizePermissionMap } from "../helpers/normalize-rules.js";

/** Custom fetch function signature for API adapter. */
export type FetchFn = (path: string, options?: RequestInit) => Promise<unknown>;

/**
 * Configuration for {@link createApiAdapter}.
 *
 * @example
 * ```ts
 * const options: ApiAdapterOptions = {
 *   endpoint: "/api/v1/user/me/permissions",
 *   fetchFn: auth.fetchFn,
 *   transformResponse: (res) => ({
 *     permissions: (res as any).data.permissions,
 *     roles: (res as any).data.roles,
 *   }),
 * };
 * ```
 */
export interface ApiAdapterOptions {
  /** API endpoint to fetch permissions from. Defaults to `"/api/me/permissions"`. */
  endpoint?: string;
  /** Custom fetch function. Defaults to the global `fetch`. */
  fetchFn?: FetchFn;
  /** Custom response transformer. */
  transformResponse?: (response: unknown) => {
    permissions: PermissionMap;
    user?: Partial<AccessUser>;
    roles?: string[];
    isSuperAdmin?: boolean;
  };
}

const defaultFetch: FetchFn = async (path, options) => {
  const res = await fetch(path, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

/**
 * Creates an adapter that fetches access rules from an API endpoint.
 *
 * @remarks
 * The default response format is `{ permissions: PermissionMap }`.
 * Also handles nested `{ body: { permissions } }` structures automatically.
 * Use `transformResponse` to parse custom server response shapes.
 *
 * Inject `auth.fetchFn` as the `fetchFn` option to automatically
 * attach authorization headers to the request.
 *
 * @param options - API adapter configuration. All fields are optional.
 * @returns An {@link AccessAdapter} that fetches rules from the configured endpoint.
 *
 * @example
 * ```ts
 * import { createApiAdapter } from "@simplix-react/access";
 *
 * const adapter = createApiAdapter({
 *   endpoint: "/api/v1/user/me/permissions",
 *   fetchFn: auth.fetchFn,
 *   transformResponse: (res) => ({
 *     permissions: (res as any).data.permissions,
 *     roles: (res as any).data.roles,
 *   }),
 * });
 * ```
 *
 * @see {@link ApiAdapterOptions} for all configuration options.
 */
export function createApiAdapter(
  options: ApiAdapterOptions = {},
): AccessAdapter {
  const {
    endpoint = "/api/me/permissions",
    fetchFn = defaultFetch,
    transformResponse,
  } = options;

  return {
    async extract(_authData: unknown): Promise<AccessExtractResult> {
      const response = await fetchFn(endpoint);

      if (transformResponse) {
        const {
          permissions,
          user: partialUser,
          roles = [],
          isSuperAdmin,
        } = transformResponse(response);
        const rules = normalizePermissionMap(permissions);
        const user: AccessUser | undefined = partialUser
          ? {
              userId: partialUser.userId ?? "",
              username: partialUser.username ?? "",
              displayName: partialUser.displayName,
              roles: partialUser.roles ?? roles,
              isSuperAdmin: isSuperAdmin ?? partialUser.isSuperAdmin,
              metadata: partialUser.metadata,
            }
          : undefined;
        return { rules, user, roles };
      }

      // Default: assume response is { permissions: PermissionMap, roles?: string[], ... }
      // Also handles nested { body: { permissions } } structure.
      const data = response as Record<string, unknown>;
      const nested = data.body as Record<string, unknown> | undefined;
      const permissions = (data.permissions ??
        nested?.permissions ??
        {}) as PermissionMap;
      const roles = (
        Array.isArray(data.roles) ? data.roles : []
      ) as string[];
      const rules = normalizePermissionMap(permissions);

      return { rules, roles };
    },
  };
}
