// Types
export type {
  SpringPermissionsResponse,
  SpringAccessAdapterOptions,
  SpringConvertResult,
} from "./types.js";

// Core
export { convertSpringPermissionsToCasl } from "./convert-permissions.js";
export { createSpringAccessAdapter } from "./spring-access-adapter.js";
export { hasBackofficeAccess } from "./backoffice-guard.js";
