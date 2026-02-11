[**Documentation**](../../README.md)

***

[Documentation](../../README.md) / @simplix-react/mock

# @simplix-react/mock

Auto-generated MSW handlers and PGlite repositories from `@simplix-react/contract`.

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
| `@electric-sql/pglite` | Optional | `>=0.2.0` — needed for in-browser PostgreSQL |

## Quick Example

```ts
import { defineContract } from "@simplix-react/contract";
import {
  setupMockWorker,
  deriveMockHandlers,
  executeSql,
} from "@simplix-react/mock";
import { z } from "zod";

// 1. Define your contract
const projectContract = defineContract({
  domain: "project",
  basePath: "/api",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({
        id: z.string(),
        title: z.string(),
        status: z.enum(["todo", "done"]),
        createdAt: z.date(),
      }),
      createSchema: z.object({ title: z.string() }),
      updateSchema: z.object({ status: z.enum(["todo", "done"]).optional() }),
    },
  },
});

// 2. Derive handlers and bootstrap
await setupMockWorker({
  dataDir: "idb://project-mock",
  migrations: [
    async (db) => {
      await executeSql(db, `
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'todo',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
    },
  ],
  seed: [],
  handlers: deriveMockHandlers(projectContract.config),
});
```

After `setupMockWorker` resolves, every `fetch("/api/tasks")` call in your application is intercepted by MSW and served from the in-browser PGlite database.

## API Overview

### Core

| Export | Description |
| --- | --- |
| `setupMockWorker(config)` | Bootstraps PGlite + MSW in one call |
| `deriveMockHandlers(config, mockConfig?)` | Generates CRUD MSW handlers from a contract |
| `MockServerConfig` | Configuration for `setupMockWorker` |
| `MockEntityConfig` | Per-entity mock configuration (table name, limits, relations) |

### PGlite Lifecycle

| Export | Description |
| --- | --- |
| `initPGlite(dataDir)` | Initializes the PGlite singleton |
| `getPGliteInstance()` | Returns the active instance (throws if uninitialized) |
| `resetPGliteInstance()` | Clears the singleton (for test teardown) |

### Result Types

| Export | Description |
| --- | --- |
| `MockResult<T>` | Discriminated success/failure result type |
| `mockSuccess(data)` | Creates a success result |
| `mockFailure(error)` | Creates a failure result |

### SQL Utilities

| Export | Description |
| --- | --- |
| `mapRow(row)` | Converts a snake_case DB row to camelCase (with Date parsing) |
| `mapRows(rows)` | Maps an array of rows |
| `toCamelCase(str)` | `snake_case` → `camelCase` |
| `toSnakeCase(str)` | `camelCase` → `snake_case` |
| `DbRow` | Type alias for `Record<string, unknown>` |
| `buildSetClause(input)` | Builds a parameterized SQL SET clause |
| `SetClauseResult` | Return type of `buildSetClause` |
| `mapPgError(err)` | Maps PGlite errors to HTTP-friendly `MockError` |
| `MockError` | Structured error with status, code, message |

### Migration Helpers

| Export | Description |
| --- | --- |
| `tableExists(db, tableName)` | Checks if a table exists |
| `columnExists(db, tableName, columnName)` | Checks if a column exists |
| `executeSql(db, sql)` | Executes semicolon-separated SQL statements |
| `addColumnIfNotExists(db, table, column, def)` | Idempotent column addition |

## Key Concepts

### MSW Handler Derivation

`deriveMockHandlers` reads your contract's entity definitions and generates five handlers per entity:

```
GET    {basePath}{entityPath}        → List (with filter, sort, pagination)
GET    {basePath}{entityPath}/:id    → Get by ID (with relation loading)
POST   {basePath}{entityPath}        → Create (auto-generates UUID)
PATCH  {basePath}{entityPath}/:id    → Partial update
DELETE {basePath}{entityPath}/:id    → Delete
```

For child entities with a `parent` definition, list and create routes are nested under the parent path:

```
GET    {basePath}{parentPath}/:parentId{entityPath}     → List by parent
POST   {basePath}{parentPath}/:parentId{entityPath}     → Create under parent
```

#### Query Parameters

List endpoints support the following query parameters:

| Parameter | Example | Description |
| --- | --- | --- |
| `sort` | `sort=title:asc,createdAt:desc` | Comma-separated `field:direction` pairs |
| `page` | `page=2` | Offset-based page number (1-indexed) |
| `limit` | `limit=20` | Rows per page (capped by `maxLimit`) |
| `{field}` | `status=done` | Equality filter on any column |

#### Relation Loading

Configure `belongsTo` relations in `MockEntityConfig` to automatically JOIN related data on GET-by-ID requests:

```ts
const handlers = deriveMockHandlers(contract.config, {
  task: {
    relations: {
      project: {
        table: "projects",
        localKey: "projectId",
        foreignKey: "id",      // defaults to "id"
        type: "belongsTo",
      },
    },
  },
});
```

### PGlite Integration

PGlite provides a full PostgreSQL database running in the browser via WebAssembly. This package manages a singleton instance:

```
initPGlite(dataDir) → getPGliteInstance() → resetPGliteInstance()
```

Data persists across page reloads via IndexedDB when using an `idb://` data directory.

### SQL Utilities

The SQL utility modules handle the mapping between JavaScript (camelCase) and PostgreSQL (snake_case) conventions:

- **Row mapping** — `mapRow`/`mapRows` convert query results to JS objects, automatically parsing `_at` columns as `Date` instances.
- **Query building** — `buildSetClause` constructs parameterized UPDATE queries from partial objects, always appending `updated_at = NOW()`.
- **Error mapping** — `mapPgError` classifies PGlite exceptions into structured errors with appropriate HTTP status codes.
- **Migration helpers** — Idempotent utilities (`tableExists`, `addColumnIfNotExists`, `executeSql`) for writing safe migration functions.

## Guides

### Writing Migrations

Migrations are async functions that receive a PGlite instance. Use the migration helpers for idempotent operations:

```ts
import type { PGlite } from "@electric-sql/pglite";
import { tableExists, executeSql, addColumnIfNotExists } from "@simplix-react/mock";

export async function migrate(db: PGlite) {
  if (!(await tableExists(db, "tasks"))) {
    await executeSql(db, `
      CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'todo',
        project_id TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  // Safe to call multiple times
  await addColumnIfNotExists(db, "tasks", "priority", "INTEGER DEFAULT 0");
}
```

### Writing Seed Functions

Seed functions populate the database with initial data after migrations:

```ts
import type { PGlite } from "@electric-sql/pglite";

export async function seed(db: PGlite) {
  await db.query(
    `INSERT INTO tasks (id, title, status) VALUES ($1, $2, $3)
     ON CONFLICT (id) DO NOTHING`,
    ["task-1", "Sample Task", "todo"],
  );
}
```

### Custom Repository Handlers

For advanced use cases beyond auto-generated CRUD, use the SQL utilities directly:

```ts
import { http, HttpResponse } from "msw";
import {
  getPGliteInstance,
  mapRows,
  mapPgError,
  mockSuccess,
  mockFailure,
} from "@simplix-react/mock";

const customHandler = http.get("/api/tasks/overdue", async () => {
  try {
    const db = getPGliteInstance();
    const result = await db.query(
      "SELECT * FROM tasks WHERE status != 'done' AND created_at < NOW() - INTERVAL '7 days'",
    );
    const tasks = mapRows(result.rows as Record<string, unknown>[]);
    return HttpResponse.json({ data: mockSuccess(tasks) });
  } catch (err) {
    const mapped = mapPgError(err);
    return HttpResponse.json(
      { code: mapped.code, message: mapped.message },
      { status: mapped.status },
    );
  }
});
```

### Testing with PGlite

Reset the singleton between tests to ensure isolation:

```ts
import { initPGlite, resetPGliteInstance, executeSql } from "@simplix-react/mock";
import { afterEach, beforeEach, describe, it } from "vitest";

describe("task repository", () => {
  beforeEach(async () => {
    const db = await initPGlite("memory://");
    await executeSql(db, `
      CREATE TABLE tasks (id TEXT PRIMARY KEY, title TEXT NOT NULL)
    `);
  });

  afterEach(() => {
    resetPGliteInstance();
  });

  it("inserts a task", async () => {
    // ...
  });
});
```

## Related Packages

| Package | Description |
| --- | --- |
| [`@simplix-react/contract`](../contract/README.md) | Define type-safe API contracts consumed by this package |
| [`@simplix-react/react`](../react/README.md) | React Query hooks derived from the same contract |
| [`@simplix-react/testing`](../testing/README.md) | Test utilities for contract-based mocking |

## Interfaces

- [MockEntityConfig](interfaces/MockEntityConfig.md)
- [MockError](interfaces/MockError.md)
- [MockResult](interfaces/MockResult.md)
- [MockServerConfig](interfaces/MockServerConfig.md)
- [SetClauseResult](interfaces/SetClauseResult.md)

## Type Aliases

- [DbRow](type-aliases/DbRow.md)

## Functions

- [addColumnIfNotExists](functions/addColumnIfNotExists.md)
- [buildSetClause](functions/buildSetClause.md)
- [columnExists](functions/columnExists.md)
- [deriveMockHandlers](functions/deriveMockHandlers.md)
- [executeSql](functions/executeSql.md)
- [getPGliteInstance](functions/getPGliteInstance.md)
- [initPGlite](functions/initPGlite.md)
- [mapPgError](functions/mapPgError.md)
- [mapRow](functions/mapRow.md)
- [mapRows](functions/mapRows.md)
- [mockFailure](functions/mockFailure.md)
- [mockSuccess](functions/mockSuccess.md)
- [resetPGliteInstance](functions/resetPGliteInstance.md)
- [setupMockWorker](functions/setupMockWorker.md)
- [tableExists](functions/tableExists.md)
- [toCamelCase](functions/toCamelCase.md)
- [toSnakeCase](functions/toSnakeCase.md)
