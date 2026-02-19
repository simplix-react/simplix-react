// Types
export type {
  DefaultActions,
  DefaultSubjects,
  AccessAbility,
  AccessRule,
  PermissionMap,
  AccessUser,
  AccessExtractResult,
  AccessAdapter,
  AccessPersistConfig,
  AccessPolicyConfig,
  AccessSnapshot,
  AccessPolicy,
} from "./types.js";

// Errors
export { AccessDeniedError } from "./errors.js";

// Core
export { createAccessPolicy } from "./create-access-policy.js";

// Adapters
export { createJwtAdapter } from "./adapters/jwt-adapter.js";
export type { JwtAdapterOptions } from "./adapters/jwt-adapter.js";
export { createApiAdapter } from "./adapters/api-adapter.js";
export type { ApiAdapterOptions, FetchFn } from "./adapters/api-adapter.js";
export { createStaticAdapter } from "./adapters/static-adapter.js";

// Helpers
export {
  normalizePermissionMap,
  normalizeFlatPermissions,
  normalizeScopePermissions,
} from "./helpers/normalize-rules.js";
export { normalizeRole, hasRole, hasAnyRole } from "./helpers/role-utils.js";
