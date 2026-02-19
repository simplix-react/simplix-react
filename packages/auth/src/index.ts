// Types
export type {
  AuthScheme,
  TokenStore,
  TokenPair,
  AuthConfig,
  AuthInstance,
  BearerSchemeOptions,
  ApiKeySchemeOptions,
  OAuth2SchemeOptions,
  CustomSchemeOptions,
} from "./types.js";

// Errors
export { AuthError } from "./errors.js";
export type { AuthErrorCode } from "./errors.js";

// Factories
export { createAuth } from "./create-auth.js";
export { createAuthFetch } from "./create-auth-fetch.js";

// Schemes
export { bearerScheme } from "./schemes/bearer-scheme.js";
export { apiKeyScheme } from "./schemes/api-key-scheme.js";
export { oauth2Scheme } from "./schemes/oauth2-scheme.js";
export { customScheme } from "./schemes/custom-scheme.js";
export { composeSchemes } from "./schemes/compose-schemes.js";

// Stores
export { memoryStore } from "./stores/memory-store.js";
export { localStorageStore } from "./stores/local-storage-store.js";
export { sessionStorageStore } from "./stores/session-storage-store.js";

// Helpers
export { AutoRefreshScheduler } from "./helpers/auto-refresh-scheduler.js";
export type { AutoRefreshSchedulerOptions } from "./helpers/auto-refresh-scheduler.js";
export { createCrossTabSync } from "./helpers/cross-tab-sync.js";
export type { CrossTabSyncOptions } from "./helpers/cross-tab-sync.js";
export { openOAuth2Popup } from "./helpers/oauth2-popup.js";
export type { OAuth2PopupOptions, OAuth2PopupResult } from "./helpers/oauth2-popup.js";
