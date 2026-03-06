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
} from "./openapi/naming/naming-strategy.js";

// ResponseAdapter types
export type {
  ResponseAdapterConfig,
  ResponseAdapterPreset,
} from "./openapi/adaptation/response-adapter.js";

// SpecProfile types
export type {
  SpecProfile,
  I18nEntityInfo,
  I18nDownloader,
} from "./openapi/orchestration/spec-profile.js";

// Plugin registry
export type { CliPlugin, SchemaAdapter } from "./openapi/plugin-registry.js";
export {
  registerSpecProfile,
  registerResponseAdapterPreset,
  registerSchemaAdapter,
  registerPlugin,
  getSpecProfile,
  getResponseAdapterPreset,
  getSchemaAdapters,
} from "./openapi/plugin-registry.js";
