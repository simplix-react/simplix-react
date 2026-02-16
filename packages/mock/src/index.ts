// PGlite
export { initPGlite, getPGliteInstance, resetPGliteInstance } from "./pglite.js";

// MSW
export { setupMockWorker } from "./msw.js";
export type { MockServerConfig, MockDomainConfig } from "./msw.js";

// Mock derivation
export { deriveMockHandlers } from "./derive-mock-handlers.js";
export type { MockEntityConfig } from "./derive-mock-handlers.js";

// Result types
export { mockSuccess, mockFailure } from "./mock-result.js";
export type { MockResult } from "./mock-result.js";

// SQL utilities
export { mapRow, mapRows, toCamelCase } from "./sql/row-mapping.js";
export type { DbRow } from "./sql/row-mapping.js";
export { buildSetClause } from "./sql/query-building.js";
export type { SetClauseResult } from "./sql/query-building.js";
export { mapPgError } from "./sql/error-mapping.js";
export type { MockError } from "./sql/error-mapping.js";
export {
  tableExists,
  columnExists,
  executeSql,
  addColumnIfNotExists,
} from "./sql/migration-helpers.js";
