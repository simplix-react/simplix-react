# Mock Handlers with MSW

> How to set up and customize MSW mock handlers derived from your API contract.

## Before You Begin

- You have an API contract defined with `defineApi` from `@simplix-react/contract`
- Install peer dependencies: `msw` and `@electric-sql/pglite`
- PGlite must be initialized before handlers process requests (see [PGlite Repositories](./pglite-repositories.md))

## Solution

### Derive Handlers from a Contract

`deriveMockHandlers` generates a full set of CRUD handlers (list, get, create, update, delete) for every entity in the contract:

```ts
import { deriveMockHandlers } from "@simplix-react/mock";
import { projectApi } from "./contract";

const handlers = deriveMockHandlers(projectApi.config);
```

This produces MSW handlers for each entity:

| Entity method | HTTP handler |
| --- | --- |
| `list` | `GET {basePath}{parent?}{path}` |
| `get` | `GET {basePath}{path}/:id` |
| `create` | `POST {basePath}{parent?}{path}` |
| `update` | `PATCH {basePath}{path}/:id` |
| `delete` | `DELETE {basePath}{path}/:id` |

### Configure Per-Entity Behavior

Pass a `MockEntityConfig` to customize table names, pagination, sorting, and relations:

```ts
import { deriveMockHandlers } from "@simplix-react/mock";
import type { MockEntityConfig } from "@simplix-react/mock";
import { projectApi } from "./contract";

const handlers = deriveMockHandlers(projectApi.config, {
  task: {
    tableName: "tasks",       // override auto-derived table name
    defaultLimit: 20,          // rows per page (default: 50)
    maxLimit: 100,             // max rows per page (default: 100)
    defaultSort: "created_at DESC",
    relations: {
      project: {
        table: "projects",
        localKey: "projectId",   // camelCase -- mapped to project_id in SQL
        type: "belongsTo",
      },
    },
  },
});
```

With `relations` configured, a `GET /tasks/:id` request automatically joins and returns the related `project` object in the response.

### Bootstrap with `setupMockWorker`

`setupMockWorker` handles the full lifecycle: PGlite init, migrations, seed data, and MSW worker start. Configuration is organized by domain using `MockDomainConfig`:

```ts
import { setupMockWorker, deriveMockHandlers } from "@simplix-react/mock";
import { projectApi } from "./contract";
import { runMigrations } from "./migrations";
import { seedData } from "./seed";

await setupMockWorker({
  dataDir: "idb://project-mock",
  domains: [
    {
      name: "project",
      handlers: deriveMockHandlers(projectApi.config),
      migrations: [runMigrations],
      seed: [seedData],
    },
  ],
});
```

The `MockServerConfig` shape:

| Field | Type | Description |
| --- | --- | --- |
| `dataDir` | `string` | IndexedDB path for PGlite (default: `"idb://simplix-mock"`) |
| `domains` | `MockDomainConfig[]` | Domain configurations to activate |

Each `MockDomainConfig` has:

| Field | Type | Description |
| --- | --- | --- |
| `name` | `string` | Domain identifier |
| `enabled` | `boolean` | Toggle this domain on/off (default: `true`) |
| `handlers` | `RequestHandler[]` | MSW handlers (from `deriveMockHandlers`) |
| `migrations` | `Array<(db: PGlite) => Promise<void>>` | Migration functions, run in order |
| `seed` | `Array<(db: PGlite) => Promise<void>>` | Seed functions, run after migrations (optional) |

### Integrate in Your App Entry Point

Call `setupMockWorker` before rendering your app, gated by an environment check:

```ts
// src/main.tsx
async function bootstrap() {
  if (import.meta.env.DEV) {
    const { setupMockWorker, deriveMockHandlers } = await import(
      "@simplix-react/mock"
    );
    const { projectApi } = await import("./contract");
    const { runMigrations } = await import("./mock/migrations");
    const { seedData } = await import("./mock/seed");

    await setupMockWorker({
      dataDir: "idb://project-mock",
      domains: [
        {
          name: "project",
          handlers: deriveMockHandlers(projectApi.config),
          migrations: [runMigrations],
          seed: [seedData],
        },
      ],
    });
  }

  const { createRoot } = await import("react-dom/client");
  const { App } = await import("./App");

  createRoot(document.getElementById("root")!).render(<App />);
}

bootstrap();
```

## Variations

### Add Custom Handlers Alongside Derived Ones

Combine contract-derived handlers with hand-written handlers for custom endpoints:

```ts
import { http, HttpResponse } from "msw";
import { setupMockWorker, deriveMockHandlers } from "@simplix-react/mock";
import { projectApi } from "./contract";
import { runMigrations } from "./mock/migrations";
import { seedData } from "./mock/seed";

const derivedHandlers = deriveMockHandlers(projectApi.config);

const customHandlers = [
  http.post("/api/v1/tasks/:taskId/assign", async ({ request, params }) => {
    const { userId } = (await request.json()) as { userId: string };
    return HttpResponse.json({
      data: { taskId: params.taskId, assigneeId: userId },
    });
  }),

  http.get("/api/v1/health", () => {
    return HttpResponse.json({ status: "ok" });
  }),
];

await setupMockWorker({
  domains: [
    {
      name: "project",
      handlers: [...customHandlers, ...derivedHandlers],
      migrations: [runMigrations],
      seed: [seedData],
    },
  ],
});
```

**Order matters**: MSW matches handlers in array order. Place custom handlers before derived ones to override default behavior for specific routes.

### Override a Derived Handler

To override a specific CRUD endpoint (e.g., return enriched data on list), place your custom handler first:

```ts
import { http, HttpResponse } from "msw";
import { deriveMockHandlers, getPGliteInstance, mapRows } from "@simplix-react/mock";
import { projectApi } from "./contract";

const derivedHandlers = deriveMockHandlers(projectApi.config);

const overrides = [
  http.get("/api/v1/tasks", async () => {
    const db = getPGliteInstance();
    const result = await db.query(`
      SELECT t.*, p.name as project_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      ORDER BY t.created_at DESC
    `);
    const rows = mapRows(result.rows as Record<string, unknown>[]);
    return HttpResponse.json({ data: rows });
  }),
];

const handlers = [...overrides, ...derivedHandlers];
```

### Multiple Contracts

When the app has multiple API domains, define each contract as a separate domain:

```ts
import { setupMockWorker, deriveMockHandlers } from "@simplix-react/mock";
import { projectApi } from "./contracts/project";
import { authApi } from "./contracts/auth";
import { runProjectMigrations } from "./mock/project-migrations";
import { runAuthMigrations } from "./mock/auth-migrations";

await setupMockWorker({
  dataDir: "idb://app-mock",
  domains: [
    {
      name: "project",
      handlers: deriveMockHandlers(projectApi.config),
      migrations: [runProjectMigrations],
    },
    {
      name: "auth",
      handlers: deriveMockHandlers(authApi.config, {
        user: { tableName: "users", defaultSort: "email ASC" },
      }),
      migrations: [runAuthMigrations],
    },
  ],
});
```

Each domain can be independently toggled via `enabled: false`, and all migrations across enabled domains run before any seeds (to support cross-domain foreign key references).

## Related

- [PGlite Repositories](./pglite-repositories.md) -- database setup, migrations, and seed data
- [Custom Fetch](./custom-fetch.md) -- customize the HTTP client used by the API contract
- `@simplix-react/mock` exports: `deriveMockHandlers`, `setupMockWorker`, `MockEntityConfig`, `MockServerConfig`
