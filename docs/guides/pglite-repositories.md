# PGlite Repositories

> How to set up PGlite for persistent mock data with migrations, seed data, and test cleanup.

## Before You Begin

- Install `@electric-sql/pglite` as a dev dependency
- PGlite runs a real PostgreSQL engine in the browser via WebAssembly
- Data persists in IndexedDB across page reloads (when using the `idb://` prefix)
- The `@simplix-react/mock` package manages PGlite as a singleton instance

## Solution

### Initialize PGlite

```ts
import { initPGlite, getPGliteInstance } from "@simplix-react/mock";

// Initialize with IndexedDB persistence
const db = await initPGlite("idb://my-app-mock");

// Later, retrieve the same instance anywhere
const db = getPGliteInstance();
await db.query("SELECT * FROM tasks");
```

`initPGlite` is idempotent -- subsequent calls return the existing instance. `getPGliteInstance` throws if called before initialization.

### Write Migrations

Migrations are functions that receive the PGlite instance and create or alter tables. Use migration helpers for idempotent operations:

```ts
// mock/migrations.ts
import type { PGlite } from "@electric-sql/pglite";
import {
  tableExists,
  columnExists,
  addColumnIfNotExists,
  executeSql,
} from "@simplix-react/mock";

export async function runMigrations(db: PGlite): Promise<void> {
  // Create tables if they do not exist
  if (!(await tableExists(db, "projects"))) {
    await executeSql(db, `
      CREATE TABLE projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  }

  if (!(await tableExists(db, "tasks"))) {
    await executeSql(db, `
      CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id),
        title TEXT NOT NULL,
        status TEXT DEFAULT 'todo',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  }

  // Add columns to existing tables (safe to re-run)
  await addColumnIfNotExists(db, "tasks", "priority", "INTEGER DEFAULT 0");
  await addColumnIfNotExists(db, "tasks", "assignee_id", "TEXT");
}
```

### Migration Helper Reference

| Helper | Purpose |
| --- | --- |
| `tableExists(db, tableName)` | Check if a table exists via `information_schema` |
| `columnExists(db, tableName, columnName)` | Check if a column exists in a table |
| `addColumnIfNotExists(db, table, column, def)` | Add a column only if it does not already exist |
| `executeSql(db, sql)` | Execute multiple semicolon-separated SQL statements |

All helpers are designed for idempotent execution -- safe to run on every app start.

### Write Seed Data

Seed functions insert initial data after migrations complete:

```ts
// mock/seed.ts
import type { PGlite } from "@electric-sql/pglite";

export async function seedData(db: PGlite): Promise<void> {
  // Check if data already exists to prevent duplicates on re-runs
  const existing = await db.query("SELECT COUNT(*) as count FROM projects");
  const count = parseInt(
    String((existing.rows[0] as Record<string, unknown>).count),
    10,
  );
  if (count > 0) return;

  await db.query(
    `INSERT INTO projects (id, name, description) VALUES ($1, $2, $3)`,
    ["proj-1", "Website Redesign", "Redesign the company website"],
  );

  await db.query(
    `INSERT INTO projects (id, name, description) VALUES ($1, $2, $3)`,
    ["proj-2", "Mobile App", "Build the mobile application"],
  );

  const tasks = [
    ["task-1", "proj-1", "Design homepage", "in_progress", 1],
    ["task-2", "proj-1", "Implement navigation", "todo", 2],
    ["task-3", "proj-2", "Set up React Native", "done", 1],
    ["task-4", "proj-2", "Create login screen", "todo", 3],
  ];

  for (const [id, projectId, title, status, priority] of tasks) {
    await db.query(
      `INSERT INTO tasks (id, project_id, title, status, priority)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, projectId, title, status, priority],
    );
  }
}
```

### Wire It All Together

Pass migrations and seed functions to `setupMockWorker`:

```ts
import { setupMockWorker, deriveMockHandlers } from "@simplix-react/mock";
import { projectApi } from "./contract";
import { runMigrations } from "./mock/migrations";
import { seedData } from "./mock/seed";

await setupMockWorker({
  dataDir: "idb://project-mock",
  migrations: [runMigrations],
  seed: [seedData],
  handlers: deriveMockHandlers(projectApi.config),
});
```

The execution order:

1. `initPGlite(dataDir)` -- start or connect to the PGlite instance
2. Run each migration function sequentially
3. Run each seed function sequentially
4. Start the MSW service worker with the provided handlers

## Variations

### Multiple Migration Files

Split migrations by domain or version for better organization:

```ts
// mock/migrations/001-projects.ts
import type { PGlite } from "@electric-sql/pglite";
import { tableExists, executeSql } from "@simplix-react/mock";

export async function createProjectsTable(db: PGlite): Promise<void> {
  if (await tableExists(db, "projects")) return;
  await executeSql(db, `
    CREATE TABLE projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}
```

```ts
// mock/migrations/002-tasks.ts
import type { PGlite } from "@electric-sql/pglite";
import { tableExists, executeSql } from "@simplix-react/mock";

export async function createTasksTable(db: PGlite): Promise<void> {
  if (await tableExists(db, "tasks")) return;
  await executeSql(db, `
    CREATE TABLE tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT REFERENCES projects(id),
      title TEXT NOT NULL,
      status TEXT DEFAULT 'todo',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}
```

```ts
// mock/migrations/index.ts
import { createProjectsTable } from "./001-projects";
import { createTasksTable } from "./002-tasks";

export const migrations = [createProjectsTable, createTasksTable];
```

```ts
// Usage
import { migrations } from "./mock/migrations";
import { seedData } from "./mock/seed";

await setupMockWorker({
  migrations,
  seed: [seedData],
  handlers,
});
```

### Test Cleanup with `resetPGliteInstance`

Reset the PGlite singleton between test runs to ensure isolation:

```ts
import { describe, it, beforeEach, afterEach } from "vitest";
import {
  initPGlite,
  resetPGliteInstance,
  getPGliteInstance,
} from "@simplix-react/mock";

describe("TaskRepository", () => {
  beforeEach(async () => {
    // Use in-memory PGlite for tests (no idb:// prefix)
    const db = await initPGlite("memory://");

    await db.query(`
      CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        status TEXT DEFAULT 'todo',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  });

  afterEach(() => {
    resetPGliteInstance();
  });

  it("should insert and retrieve a task", async () => {
    const db = getPGliteInstance();
    await db.query(
      "INSERT INTO tasks (id, title) VALUES ($1, $2)",
      ["t-1", "Test task"],
    );

    const result = await db.query("SELECT * FROM tasks WHERE id = $1", ["t-1"]);
    expect(result.rows).toHaveLength(1);
  });
});
```

### Direct SQL Queries in Handlers

Access PGlite directly in custom MSW handlers for advanced queries:

```ts
import { http, HttpResponse } from "msw";
import { getPGliteInstance, mapRows } from "@simplix-react/mock";

const customHandler = http.get("/api/v1/dashboard/stats", async () => {
  const db = getPGliteInstance();

  const result = await db.query(`
    SELECT
      p.id,
      p.name,
      COUNT(t.id) as task_count,
      COUNT(t.id) FILTER (WHERE t.status = 'done') as done_count
    FROM projects p
    LEFT JOIN tasks t ON t.project_id = p.id
    GROUP BY p.id, p.name
    ORDER BY p.name
  `);

  const stats = mapRows(result.rows as Record<string, unknown>[]);
  return HttpResponse.json({ data: stats });
});
```

### Column-Level Schema Evolution

Use `columnExists` and `addColumnIfNotExists` for incremental schema changes:

```ts
import type { PGlite } from "@electric-sql/pglite";
import { columnExists, addColumnIfNotExists } from "@simplix-react/mock";

export async function migrateV2(db: PGlite): Promise<void> {
  // Add new columns safely
  await addColumnIfNotExists(db, "tasks", "due_date", "DATE");
  await addColumnIfNotExists(db, "tasks", "labels", "JSONB DEFAULT '[]'");

  // Conditional data migration
  if (await columnExists(db, "tasks", "priority")) {
    await db.query(`
      UPDATE tasks SET labels = '["high"]'::jsonb
      WHERE priority >= 3 AND labels = '[]'::jsonb
    `);
  }
}
```

## Related

- [Mock Handlers](./mock-handlers.md) -- derive and customize MSW handlers from contracts
- [Custom Fetch](./custom-fetch.md) -- customize the HTTP client for authentication and error handling
- `@simplix-react/mock` exports: `initPGlite`, `getPGliteInstance`, `resetPGliteInstance`, `tableExists`, `columnExists`, `addColumnIfNotExists`, `executeSql`
