import type {
  AccessAdapter,
  AccessExtractResult,
  AccessUser,
} from "../types.js";
import {
  normalizeFlatPermissions,
  normalizePermissionMap,
  normalizeScopePermissions,
} from "../helpers/normalize-rules.js";

/**
 * Configuration for {@link createJwtAdapter}.
 *
 * @example
 * ```ts
 * const options: JwtAdapterOptions = {
 *   permissionFormat: "map",
 *   permissionsKey: "permissions",
 *   rolesKey: "roles",
 *   userIdKey: "sub",
 * };
 * ```
 */
export interface JwtAdapterOptions {
  /** JWT claim key for roles. Defaults to `"roles"`. */
  rolesKey?: string;
  /** JWT claim key for permissions. Defaults to `"permissions"`. */
  permissionsKey?: string;
  /** JWT claim key for super-admin flag. Defaults to `"isSuperAdmin"`. */
  superAdminKey?: string;
  /** JWT claim key for user ID. Defaults to `"sub"`. */
  userIdKey?: string;
  /** JWT claim key for username. Defaults to `"username"`. */
  usernameKey?: string;
  /**
   * Format of the permissions claim.
   *
   * - `"map"` — `{ resource: [actions] }` object.
   * - `"flat"` — `["RESOURCE:action"]` array.
   * - `"scopes"` — Space-delimited OAuth2 scope string.
   *
   * Defaults to `"map"`.
   */
  permissionFormat?: "map" | "flat" | "scopes";
  /** Separator for flat/scopes formats. Defaults to `":"`. */
  flatSeparator?: string;
  /** Custom JWT decode function. Defaults to base64url payload parsing. */
  decode?: (token: string) => Record<string, unknown>;
  /** Custom transform that replaces default extraction logic entirely. */
  transform?: (claims: Record<string, unknown>) => AccessExtractResult;
}

/**
 * Decodes a JWT payload without signature verification.
 * Suitable for client-side extraction only.
 */
function defaultDecode(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");
  const payload = parts[1]!;
  const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(decoded) as Record<string, unknown>;
}

/**
 * Creates an adapter that extracts access rules from a JWT token.
 *
 * @remarks
 * Decodes the JWT payload client-side (no signature verification)
 * and converts the claims into CASL rules. Supports three permission
 * formats: `"map"` (Spring Security), `"flat"` (authorities), and
 * `"scopes"` (OAuth2). Use `decode` for custom JWT formats and
 * `transform` to bypass default extraction entirely.
 *
 * @param options - JWT adapter configuration. All fields are optional.
 * @returns An {@link AccessAdapter} that extracts rules from JWT strings.
 *
 * @example
 * ```ts
 * import { createJwtAdapter } from "@simplix-react/access";
 *
 * const adapter = createJwtAdapter({
 *   permissionFormat: "flat",
 *   flatSeparator: ":",
 *   rolesKey: "authorities",
 * });
 * ```
 *
 * @see {@link JwtAdapterOptions} for all configuration options.
 */
export function createJwtAdapter(
  options: JwtAdapterOptions = {},
): AccessAdapter {
  const {
    rolesKey = "roles",
    permissionsKey = "permissions",
    superAdminKey = "isSuperAdmin",
    userIdKey = "sub",
    usernameKey = "username",
    permissionFormat = "map",
    flatSeparator = ":",
    decode = defaultDecode,
    transform,
  } = options;

  return {
    async extract(authData: unknown): Promise<AccessExtractResult> {
      const token = typeof authData === "string" ? authData : null;
      if (!token) return { rules: [], roles: [] };

      const claims = decode(token);

      if (transform) return transform(claims);

      const rawRoles = Array.isArray(claims[rolesKey])
        ? (claims[rolesKey] as string[])
        : [];
      const isSuperAdmin =
        claims[superAdminKey] === true || claims[superAdminKey] === "true";

      const user: AccessUser = {
        userId: String(claims[userIdKey] ?? ""),
        username: String(claims[usernameKey] ?? ""),
        roles: rawRoles,
        isSuperAdmin,
      };

      const rawPermissions = claims[permissionsKey];
      let rules: AccessExtractResult["rules"];

      if (
        permissionFormat === "map" &&
        rawPermissions &&
        typeof rawPermissions === "object" &&
        !Array.isArray(rawPermissions)
      ) {
        rules = normalizePermissionMap(
          rawPermissions as Record<string, string[]>,
        );
      } else if (
        permissionFormat === "flat" &&
        Array.isArray(rawPermissions)
      ) {
        rules = normalizeFlatPermissions(
          rawPermissions as string[],
          flatSeparator,
        );
      } else if (
        permissionFormat === "scopes" &&
        typeof rawPermissions === "string"
      ) {
        rules = normalizeScopePermissions(rawPermissions, flatSeparator);
      } else if (
        permissionFormat === "scopes" &&
        typeof claims["scope"] === "string"
      ) {
        rules = normalizeScopePermissions(
          claims["scope"] as string,
          flatSeparator,
        );
      } else {
        rules = [];
      }

      return { rules, user, roles: rawRoles };
    },
  };
}
