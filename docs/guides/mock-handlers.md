# Mock Handlers with MSW

> How to set up and customize MSW mock handlers derived from your API contract.

## Before You Begin

- You have an API contract defined with `defineApi` from `@simplix-react/contract`
- Install peer dependency: `msw`

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

All handlers read from and write to in-memory `Map`-based stores managed by `getEntityStore`. Each entity's store is keyed by a store name following the convention `{domain}_{snake_case_entity}` (e.g., `"project_tasks"`).

### Configure Per-Entity Behavior

Pass a `MockEntityConfig` to customize pagination, sorting, relations, and custom resolvers:

```ts
import { deriveMockHandlers } from "@simplix-react/mock";
import type { MockEntityConfig } from "@simplix-react/mock";
import { projectApi } from "./contract";

const handlers = deriveMockHandlers(projectApi.config, {
  task: {
    defaultLimit: 20,          // rows per page (default: 50)
    maxLimit: 100,             // max rows per page (default: 100)
    defaultSort: "createdAt:desc",
    relations: {
      project: {
        entity: "project",
        localKey: "projectId",
        type: "belongsTo",
      },
    },
  },
});
```

With `relations` configured, a `GET /tasks/:id` request automatically looks up and returns the related `project` object in the response.

### Bootstrap with `setupMockWorker`

`setupMockWorker` handles the full lifecycle: store reset, seed data loading, and MSW worker start. Configuration is organized by domain using `MockDomainConfig`:

```ts
import { setupMockWorker, deriveMockHandlers } from "@simplix-react/mock";
import { projectApi } from "./contract";

await setupMockWorker({
  domains: [
    {
      name: "project",
      handlers: deriveMockHandlers(projectApi.config),
      seed: {
        project_tasks: [
          { id: 1, title: "Design API", status: "done", createdAt: "2025-01-01" },
          { id: 2, title: "Implement UI", status: "in_progress", createdAt: "2025-01-02" },
        ],
        project_projects: [
          { id: 1, name: "Simplix", createdAt: "2025-01-01" },
        ],
      },
    },
  ],
});
```

The `MockServerConfig` shape:

| Field | Type | Description |
| --- | --- | --- |
| `domains` | `MockDomainConfig[]` | Domain configurations to activate |

Each `MockDomainConfig` has:

| Field | Type | Description |
| --- | --- | --- |
| `name` | `string` | Domain identifier (used for logging/debugging) |
| `enabled` | `boolean` | Toggle this domain on/off (default: `true`) |
| `handlers` | `RequestHandler[]` | MSW handlers (from `deriveMockHandlers`) |
| `seed` | `Record<string, Record<string, unknown>[]>` | Seed data keyed by store name (optional) |

Seed keys follow the store naming convention `{domain}_{snake_case_entity}`. Each value is an array of plain objects representing the initial records.

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
    const { seedData } = await import("./mock/seed");

    await setupMockWorker({
      domains: [
        {
          name: "project",
          handlers: deriveMockHandlers(projectApi.config),
          seed: seedData,
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

Where `seedData` is a plain record:

```ts
// mock/seed.ts
export const seedData: Record<string, Record<string, unknown>[]> = {
  project_tasks: [
    { id: 1, title: "Design API", status: "done", createdAt: "2025-01-01" },
    { id: 2, title: "Implement UI", status: "in_progress", createdAt: "2025-01-02" },
  ],
  project_projects: [
    { id: 1, name: "Simplix", createdAt: "2025-01-01" },
  ],
};
```

## Variations

### Add Custom Handlers Alongside Derived Ones

Combine contract-derived handlers with hand-written handlers for custom endpoints:

```ts
import { http, HttpResponse } from "msw";
import { setupMockWorker, deriveMockHandlers } from "@simplix-react/mock";
import { projectApi } from "./contract";
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
      seed: seedData,
    },
  ],
});
```

**Order matters**: MSW matches handlers in array order. Place custom handlers before derived ones to override default behavior for specific routes.

### Override a Derived Handler

To override a specific CRUD endpoint (e.g., return enriched data on list), place your custom handler first. Use `getEntityStore` to access the in-memory `Map` directly:

```ts
import { http, HttpResponse } from "msw";
import { deriveMockHandlers, getEntityStore } from "@simplix-react/mock";
import { projectApi } from "./contract";

const derivedHandlers = deriveMockHandlers(projectApi.config);

const overrides = [
  http.get("/api/v1/tasks", () => {
    const taskStore = getEntityStore("project_tasks");
    const projectStore = getEntityStore("project_projects");

    const tasks = Array.from(taskStore.values()).map((task) => {
      const project = projectStore.get(task.projectId as string | number);
      return {
        ...task,
        projectName: project ? (project.name as string) : null,
      };
    });

    // Sort by createdAt descending
    tasks.sort((a, b) =>
      String(b.createdAt).localeCompare(String(a.createdAt)),
    );

    return HttpResponse.json({ data: tasks });
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

await setupMockWorker({
  domains: [
    {
      name: "project",
      handlers: deriveMockHandlers(projectApi.config),
      seed: {
        project_tasks: [
          { id: 1, title: "Task 1", createdAt: "2025-01-01" },
        ],
      },
    },
    {
      name: "auth",
      handlers: deriveMockHandlers(authApi.config, {
        user: { defaultSort: "email:asc" },
      }),
      seed: {
        auth_users: [
          { id: 1, email: "admin@example.com", role: "admin" },
        ],
      },
    },
  ],
});
```

Each domain can be independently toggled via `enabled: false`. All seed data across enabled domains is loaded before the MSW worker starts.

## Related

- [Custom Fetch](./custom-fetch.md) -- customize the HTTP client used by the API contract
- `@simplix-react/mock` exports: `deriveMockHandlers`, `setupMockWorker`, `getEntityStore`, `getNextId`, `seedEntityStore`, `resetStore`, `MockEntityConfig`, `MockServerConfig`
