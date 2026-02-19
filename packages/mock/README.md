<p align="center">
  <img src="../../docs/assets/simplix-logo.png" alt="simplix-react" width="200" />
</p>

# @simplix-react/mock

Auto-generated MSW handlers and in-memory stores from `@simplix-react/contract`.

> **Prerequisites:** Requires a contract defined with `@simplix-react/contract`.

## Installation

```bash
pnpm add @simplix-react/mock
```

Peer dependencies:

| Package | Required | Notes |
| --- | --- | --- |
| `@simplix-react/contract` | Yes | Provides the API contract definition |
| `zod` | Yes | `>=4.0.0` |
| `msw` | Optional | `>=2.0.0` — needed for MSW handler generation |
| `vite` | Optional | `>=5.0.0` — needed for the Vite plugin |

## Quick Example

```ts
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";
import { setupMockWorker, deriveMockHandlers } from "@simplix-react/mock";
import { z } from "zod";

// 1. Define your contract
const projectContract = defineApi({
  domain: "project",
  basePath: "/api",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({
        id: z.number(),
        title: z.string(),
        status: z.enum(["todo", "done"]),
        createdAt: z.string(),
      }),
      createSchema: z.object({ title: z.string() }),
      updateSchema: z.object({ status: z.enum(["todo", "done"]).optional() }),
    },
  },
  queryBuilder: simpleQueryBuilder,
});

// 2. Derive handlers and bootstrap
await setupMockWorker({
  domains: [
    {
      name: "project",
      handlers: deriveMockHandlers(projectContract.config),
      seed: {
        project_tasks: [
          { id: 1, title: "Sample Task", status: "todo", createdAt: "2025-01-01T00:00:00Z" },
        ],
      },
    },
  ],
});
```

After `setupMockWorker` resolves, every `fetch("/api/tasks")` call in your application is intercepted by MSW and served from the in-memory store.

## API Overview

### Core

| Export | Description |
| --- | --- |
| `setupMockWorker(config)` | Bootstraps in-memory stores + MSW in one call |
| `deriveMockHandlers(config, mockConfig?)` | Generates CRUD MSW handlers from a contract |
| `MockServerConfig` | Domain-based configuration for `setupMockWorker` |
| `MockDomainConfig` | Per-domain mock configuration (handlers, seed, toggle) |
| `MockEntityConfig` | Per-entity mock configuration (limits, relations, resolvers) |

### In-Memory Store

| Export | Description |
| --- | --- |
| `getEntityStore(storeName)` | Returns the `Map` for the given store (creates lazily) |
| `getNextId(storeName)` | Returns the next auto-increment numeric ID |
| `seedEntityStore(storeName, records)` | Loads records into a store and sets the ID counter |
| `resetStore()` | Clears all stores and counters |

### Result Types

| Export | Description |
| --- | --- |
| `MockResult<T>` | Discriminated success/failure result type |
| `mockSuccess(data)` | Creates a success result |
| `mockFailure(error)` | Creates a failure result |

### Tree Builder

| Export | Description |
| --- | --- |
| `buildTreeFromFlatRows(rows, identityField?)` | Converts flat parent-child rows to a recursive tree |

### Vite Plugin

| Export | Description |
| --- | --- |
| `mswPlugin()` | Serves `mockServiceWorker.js` without copying it to `public/` |

## Key Concepts

### In-Memory Store

Each entity gets its own `Map<string | number, Record<string, unknown>>`, keyed by a store name following the `{domain}_{snake_case_entity}` convention (e.g. `"project_tasks"`).

The store is fully synchronous:

- **Read** — iterate or look up by ID from the Map
- **Write** — set/delete entries directly
- **ID generation** — `getNextId` provides auto-increment numeric IDs
- **Seeding** — `seedEntityStore` populates records and adjusts the counter to the max existing numeric ID
- **Reset** — `resetStore` clears all stores and counters (called automatically by `setupMockWorker`)

Data lives in memory only and is lost on page reload, making it ideal for development and testing.

### MSW Handler Derivation

`deriveMockHandlers` reads your contract's entity definitions and generates handlers for each CRUD operation based on its role:

```
GET    {basePath}{entityPath}        → List (with filter, sort, pagination)
GET    {basePath}{entityPath}/:id    → Get by ID (with relation loading)
POST   {basePath}{entityPath}        → Create (auto-generates numeric ID)
PATCH  {basePath}{entityPath}/:id    → Partial update
DELETE {basePath}{entityPath}/:id    → Delete
GET    {basePath}{entityPath}/tree   → Tree query (hierarchical data)
```

For child entities with a `parent` definition, list and create routes are nested under the parent path:

```
GET    {basePath}{parentPath}/:parentId{entityPath}     → List by parent
POST   {basePath}{parentPath}/:parentId{entityPath}     → Create under parent
```

Non-standard operations are handled by inferring behavior from the HTTP method and path structure. Custom resolvers can override any operation.

#### Query Parameters

List endpoints support the following query parameters:

| Parameter | Example | Description |
| --- | --- | --- |
| `sort` | `sort=title:asc,createdAt:desc` | Comma-separated `field:direction` pairs |
| `page` | `page=2` | Offset-based page number (1-indexed) |
| `limit` | `limit=20` | Rows per page (capped by `maxLimit`) |
| `{field}` | `status=done` | Equality filter on any field |

When `page` or `cursor` is present, the response includes pagination metadata:

```json
{
  "data": {
    "data": [...],
    "meta": { "total": 100, "page": 2, "limit": 20, "hasNextPage": true }
  }
}
```

#### Relation Loading

Configure `belongsTo` relations in `MockEntityConfig` to automatically join related data on GET-by-ID requests:

```ts
const handlers = deriveMockHandlers(contract.config, {
  task: {
    relations: {
      project: {
        entity: "project",
        localKey: "projectId",
        foreignKey: "id", // defaults to "id"
        type: "belongsTo",
      },
    },
  },
});
```

When fetching a task, the related `project` record is looked up from the `{domain}_project` store and embedded in the response.

#### Tree Queries

Entities with a `tree` role operation support hierarchical queries. The handler converts flat rows with `parentId` fields into a nested tree structure using `buildTreeFromFlatRows`.

Pass `rootId` as a query parameter to retrieve a subtree starting from a specific node:

```
GET /api/categories/tree?rootId=cat-1
```

#### Custom Resolvers

Override any operation with a custom resolver for logic that goes beyond standard CRUD:

```ts
const handlers = deriveMockHandlers(contract.config, {
  task: {
    resolvers: {
      batchCreate: async ({ request }) => {
        const tasks = await request.json();
        // Custom batch logic...
        return HttpResponse.json({ data: created }, { status: 201 });
      },
    },
  },
});
```

### Domain-Based Configuration

`setupMockWorker` organizes handlers by domain with per-domain toggling:

```ts
await setupMockWorker({
  domains: [
    {
      name: "project",
      enabled: true, // default
      handlers: deriveMockHandlers(projectContract.config),
      seed: {
        project_tasks: [
          { id: 1, title: "Task 1", status: "todo", createdAt: "2025-01-01T00:00:00Z" },
        ],
      },
    },
    {
      name: "user",
      enabled: false, // disabled — handlers won't be registered
      handlers: deriveMockHandlers(userContract.config),
    },
  ],
});
```

The bootstrap sequence:

1. Filters domains to only those with `enabled !== false`
2. Resets all in-memory stores
3. Seeds each entity store from domain `seed` data
4. Starts the MSW service worker with combined handlers

### Error Handling

Failed operations return structured errors with appropriate HTTP status codes:

| Error Code | HTTP Status | Description |
| --- | --- | --- |
| `not_found` | 404 | Record does not exist |
| `unique_violation` | 409 | Duplicate key conflict |
| `foreign_key_violation` | 422 | Referenced record missing |
| Other | 500 | Unexpected error |

### Vite Plugin

The `mswPlugin` eliminates the need to manually copy `mockServiceWorker.js` into your `public/` directory:

```ts
// vite.config.ts
import { mswPlugin } from "@simplix-react/mock/vite";

export default defineConfig({
  plugins: [mswPlugin()],
});
```

- **Dev mode** — serves the worker script via middleware at `/mockServiceWorker.js`
- **Build mode** — emits it as a static asset in the output directory

## Guides

### Seeding Data

Seed data is provided per entity store in the domain config. Store names follow the `{domain}_{snake_case_entity}` convention:

```ts
const projectDomain: MockDomainConfig = {
  name: "project",
  handlers: deriveMockHandlers(projectContract.config),
  seed: {
    project_tasks: [
      { id: 1, title: "Design mockups", status: "done", createdAt: "2025-01-01T00:00:00Z" },
      { id: 2, title: "Implement API", status: "todo", createdAt: "2025-01-02T00:00:00Z" },
    ],
    project_projects: [
      { id: 1, name: "Acme Project", createdAt: "2025-01-01T00:00:00Z" },
    ],
  },
};
```

You can also seed stores programmatically:

```ts
import { seedEntityStore } from "@simplix-react/mock";

seedEntityStore("project_tasks", [
  { id: 1, title: "Task 1", status: "todo" },
  { id: 2, title: "Task 2", status: "done" },
]);
```

### Custom Handlers

For endpoints beyond auto-generated CRUD, create MSW handlers that use the in-memory store directly:

```ts
import { http, HttpResponse } from "msw";
import { getEntityStore, mockSuccess } from "@simplix-react/mock";

const overdueHandler = http.get("/api/tasks/overdue", () => {
  const store = getEntityStore("project_tasks");
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const overdue = Array.from(store.values()).filter(
    (task) => task.status !== "done" && (task.createdAt as string) < weekAgo,
  );

  return HttpResponse.json({ data: mockSuccess(overdue) });
});
```

Include custom handlers alongside derived ones in your domain config:

```ts
const projectDomain: MockDomainConfig = {
  name: "project",
  handlers: [...deriveMockHandlers(projectContract.config), overdueHandler],
};
```

### Testing

Reset stores between tests to ensure isolation:

```ts
import { resetStore, seedEntityStore, getEntityStore } from "@simplix-react/mock";
import { afterEach, beforeEach, describe, it, expect } from "vitest";

describe("task store", () => {
  beforeEach(() => {
    resetStore();
    seedEntityStore("project_tasks", [
      { id: 1, title: "Test Task", status: "todo" },
    ]);
  });

  afterEach(() => {
    resetStore();
  });

  it("retrieves seeded data", () => {
    const store = getEntityStore("project_tasks");
    expect(store.get(1)).toEqual({ id: 1, title: "Test Task", status: "todo" });
  });
});
```

## Related Packages

| Package | Description |
| --- | --- |
| [`@simplix-react/contract`](../contract) | Define type-safe API contracts consumed by this package |
| [`@simplix-react/react`](../react) | React Query hooks derived from the same contract |
| [`@simplix-react/testing`](../testing) | Test utilities for contract-based mocking |
