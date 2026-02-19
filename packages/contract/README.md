<p align="center">
  <img src="../../docs/assets/simplix-logo.png" alt="simplix-react" width="200" />
</p>

# @simplix-react/contract

Define type-safe API contracts with Zod schemas. A single contract drives your HTTP client, React Query hooks, and MSW mock handlers.

## Installation

```bash
pnpm add @simplix-react/contract
```

**Peer dependency:** `zod >= 4.0.0`

```bash
pnpm add zod
```

## Quick Example

```ts
import { z } from "zod";
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";

// 1. Define your contract
const projectApi = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({
        id: z.string(),
        title: z.string(),
        status: z.enum(["open", "closed"]),
      }),
      createSchema: z.object({
        title: z.string(),
      }),
      updateSchema: z.object({
        title: z.string().optional(),
        status: z.enum(["open", "closed"]).optional(),
      }),
    },
  },
  queryBuilder: simpleQueryBuilder,
});

// 2. Use the type-safe client
const tasks = await projectApi.client.task.list();
const task = await projectApi.client.task.get("task-1");
const created = await projectApi.client.task.create({ title: "New task" });
const updated = await projectApi.client.task.update("task-1", { status: "closed" });
await projectApi.client.task.delete("task-1");

// 3. Use query keys for cache management
projectApi.queryKeys.task.all;                      // ["project", "task"]
projectApi.queryKeys.task.lists();                   // ["project", "task", "list"]
projectApi.queryKeys.task.list({ status: "open" });  // ["project", "task", "list", { status: "open" }]
projectApi.queryKeys.task.detail("task-1");          // ["project", "task", "detail", "task-1"]
```

## API Overview

| Export | Kind | Description |
| --- | --- | --- |
| `defineApi` | Function | Creates a contract with client and query keys from a config |
| `deriveClient` | Function | Generates a type-safe HTTP client from a contract config |
| `deriveQueryKeys` | Function | Generates TanStack Query key factories from a contract config |
| `buildPath` | Function | Substitutes `:param` placeholders in URL templates |
| `defaultFetch` | Function | Built-in fetch with JSON content-type and `{ data }` envelope unwrapping |
| `ApiError` | Class | Error type for non-2xx HTTP responses |
| `simpleQueryBuilder` | Object | Ready-made `QueryBuilder` for common REST query string patterns |
| `camelToSnake` | Function | Converts camelCase to snake_case |

### Type Exports

| Export | Description |
| --- | --- |
| `EntityDefinition` | Describes a CRUD entity with Zod schemas |
| `EntityParent` | Parent resource for nested URL construction |
| `EntityQuery` | Named query scope filtering by parent relationship |
| `OperationDefinition` | Describes a custom non-CRUD API operation |
| `HttpMethod` | Union of supported HTTP methods |
| `ApiContractConfig` | Full configuration input for `defineApi` |
| `ApiContract` | Return type of `defineApi` |
| `EntityClient` | CRUD client interface for a single entity |
| `QueryKeyFactory` | Structured query key generators for TanStack Query |
| `FetchFn` | Custom fetch function signature |
| `ListParams` | Filters, sort, and pagination parameters for list queries |
| `SortParam` | Sort field and direction |
| `PaginationParam` | Offset-based or cursor-based pagination |
| `PageInfo` | Server-returned pagination metadata |
| `QueryBuilder` | Interface for serializing list params to URL search params |

## Key Concepts

### Zod Schema → Type Inference

Every contract type is inferred from Zod schemas at compile time. You define schemas once; TypeScript infers the rest:

```ts
import { z } from "zod";

const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(["open", "closed"]),
});

// z.infer<typeof taskSchema> → { id: string; title: string; status: "open" | "closed" }
```

The framework uses these inferred types throughout the client, hooks, and mock handlers, so your API types are always in sync with validation logic.

### EntityDefinition

An `EntityDefinition` is the building block for CRUD resources. It bundles three schemas:

- **`schema`** — The full entity shape returned by the API
- **`createSchema`** — The payload required to create a new entity
- **`updateSchema`** — The payload for partial updates

```ts
const taskEntity = {
  path: "/tasks",
  schema: taskSchema,
  createSchema: z.object({ title: z.string() }),
  updateSchema: z.object({ title: z.string().optional() }),
};
```

This single definition drives `list`, `get`, `create`, `update`, and `delete` methods on the client.

### OperationDefinition

For endpoints that don't fit the CRUD pattern (file uploads, RPC-style calls, batch operations), use `OperationDefinition`:

```ts
import { z } from "zod";
import { defineApi } from "@simplix-react/contract";

const api = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: { task: taskEntity },
  operations: {
    assignTask: {
      method: "POST",
      path: "/tasks/:taskId/assign",
      input: z.object({ userId: z.string() }),
      output: z.object({ id: z.string(), assigneeId: z.string() }),
    },
    exportReport: {
      method: "GET",
      path: "/projects/:projectId/export",
      input: z.object({}),
      output: z.any(),
      responseType: "blob",
    },
  },
});

// Path params are positional arguments, input is the last argument
await api.client.assignTask("task-1", { userId: "user-42" });
```

### Nested Entities (Parent Relationships)

Entities can declare a `parent` for nested URL construction:

```ts
const taskEntity = {
  path: "/tasks",
  schema: taskSchema,
  createSchema: createTaskSchema,
  updateSchema: updateTaskSchema,
  parent: { param: "projectId", path: "/projects" },
};

// Client adjusts URLs based on parent
await api.client.task.list("project-1");
// GET /api/v1/projects/project-1/tasks

await api.client.task.create("project-1", { title: "New task" });
// POST /api/v1/projects/project-1/tasks
```

### Query Keys

The contract automatically generates TanStack Query-compatible key factories with hierarchical structure:

```
task.all              → ["project", "task"]                          (broadest)
task.lists()          → ["project", "task", "list"]
task.list({ ... })    → ["project", "task", "list", { ... }]
task.details()        → ["project", "task", "detail"]
task.detail("id")     → ["project", "task", "detail", "id"]         (most specific)
```

Invalidating a broader key automatically invalidates all more-specific keys beneath it.

## Guides

### Custom Fetch Function

Replace the built-in HTTP client with custom logic for authentication, logging, or retry:

```ts
import { defineApi, defaultFetch } from "@simplix-react/contract";

const api = defineApi(config, {
  fetchFn: async (path, options) => {
    const token = await getAuthToken();
    return defaultFetch(path, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  },
});
```

### Custom Query Builder

Implement the `QueryBuilder` interface to match your API's query string conventions:

```ts
import { defineApi } from "@simplix-react/contract";
import type { QueryBuilder } from "@simplix-react/contract";

const springQueryBuilder: QueryBuilder = {
  buildSearchParams(params) {
    const sp = new URLSearchParams();
    if (params.pagination?.type === "offset") {
      // Spring uses 0-based page indexing
      sp.set("page", String(params.pagination.page - 1));
      sp.set("size", String(params.pagination.limit));
    }
    if (params.sort) {
      const sorts = Array.isArray(params.sort) ? params.sort : [params.sort];
      for (const s of sorts) {
        sp.append("sort", `${s.field},${s.direction}`);
      }
    }
    return sp;
  },
};

const api = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: { task: taskEntity },
  queryBuilder: springQueryBuilder,
});
```

### Multipart File Uploads

Use `contentType: "multipart"` in an operation definition for file upload endpoints:

```ts
const api = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {},
  operations: {
    uploadAvatar: {
      method: "POST",
      path: "/users/:userId/avatar",
      input: z.object({ file: z.instanceof(File) }),
      output: z.object({ url: z.string() }),
      contentType: "multipart",
    },
  },
});

await api.client.uploadAvatar("user-1", { file: selectedFile });
```

### Error Handling

All client methods throw `ApiError` for non-2xx responses:

```ts
import { ApiError } from "@simplix-react/contract";

try {
  await api.client.task.get("nonexistent");
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status); // 404
    console.log(error.body);   // Raw response body
  }
}
```

## Related Packages

| Package | Description |
| --- | --- |
| `@simplix-react/react` | Derives React Query hooks from the contract |
| `@simplix-react/mock` | Generates MSW handlers with in-memory stores from the contract |
| `@simplix-react/testing` | Test utilities built on top of the contract and mock packages |

---

**Next Step** → [`@simplix-react/react`](../react/README.md) — Turn your contract into React Query hooks.
