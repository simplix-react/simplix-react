// In-memory store (contract system)
export { getEntityStore, getNextId, seedEntityStore, resetStore } from "./mock-store.js";

// Typed entity store (Orval models)
export { createMockEntityStore } from "./mock-entity-store.js";
export type { MockEntityStore, PagedResult } from "./mock-entity-store.js";

// MSW
export { setupMockWorker } from "./msw.js";
export type { MockServerConfig, MockDomainConfig } from "./msw.js";

// Mock derivation
export { deriveMockHandlers } from "./derive-mock-handlers.js";
export type { MockEntityConfig, MockHandlerOptions, MockResponseWrapper } from "./derive-mock-handlers.js";

// Result types
export { mockSuccess, mockFailure } from "./mock-result.js";
export type { MockResult } from "./mock-result.js";

// Tree builder
export { buildEmbeddedTree, buildTreeFromFlatRows } from "./tree-builder.js";
