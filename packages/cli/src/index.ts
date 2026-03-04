export { defineConfig } from "./config/define-config.js";
export { defineCrudMap } from "./config/define-crud-map.js";
export type {
  SimplixConfig,
  OpenAPISpecConfig,
  CrudEndpointPattern,
  CrudEntityConfig,
  CrudMap,
  SimplixHttpEnvironment,
} from "./config/types.js";

// NamingStrategy types
export type {
  EntityNameContext,
  OperationContext,
  ResolvedOperation,
  OpenApiNamingStrategy,
} from "./openapi/naming-strategy.js";

// ResponseAdapter types
export type {
  ResponseAdapterConfig,
  ResponseAdapterPreset,
} from "./openapi/response-adapter.js";

// SpecProfile types
export type { SpecProfile } from "./openapi/spec-profile.js";
