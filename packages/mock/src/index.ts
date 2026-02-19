// In-memory store
export { getEntityStore, getNextId, seedEntityStore, resetStore } from "./mock-store.js";

// MSW
export { setupMockWorker } from "./msw.js";
export type { MockServerConfig, MockDomainConfig } from "./msw.js";

// Mock derivation
export { deriveMockHandlers } from "./derive-mock-handlers.js";
export type { MockEntityConfig } from "./derive-mock-handlers.js";

// Result types
export { mockSuccess, mockFailure } from "./mock-result.js";
export type { MockResult } from "./mock-result.js";

// Tree builder
export { buildTreeFromFlatRows } from "./tree-builder.js";
