# Defining Entities in a Contract

> Define type-safe CRUD entities with Zod schemas so the framework can derive clients, hooks, and mock handlers automatically.

## Before You Begin

- Install dependencies: `@simplix-react/contract` and `zod`
- Familiarize yourself with [Zod schema basics](https://zod.dev)

## Solution

### Step 1 -- Define Zod Schemas

Every entity needs three schemas: the full entity shape, the create payload, and the update payload.

```ts
import { z } from "zod";

// Full entity shape returned by the API
const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  status: z.enum(["active", "archived"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Payload for creating a new project
const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
});

// Payload for updating an existing project (all fields optional)
const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["active", "archived"]).optional(),
});
```

### Step 2 -- Create an EntityDefinition

Combine the schemas with a URL path to form a complete entity definition.

```ts
import type { EntityDefinition } from "@simplix-react/contract";

const projectEntity = {
  path: "/projects",
  schema: projectSchema,
  createSchema: createProjectSchema,
  updateSchema: updateProjectSchema,
} satisfies EntityDefinition;
```

The `path` field is the URL segment for this entity. It is appended to the contract's `basePath` when making requests (e.g., `basePath + "/projects"` → `/api/v1/projects`).

### Step 3 -- Register in an API Contract

Pass the entity definition into `defineApi` to get a fully typed client and query keys.

```ts
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";

const projectApi = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    project: projectEntity,
  },
  queryBuilder: simpleQueryBuilder,
});
```

### Step 4 -- Use the Derived Client

The returned contract exposes a type-safe HTTP client for every registered entity.

```ts
// List all projects
const projects = await projectApi.client.project.list();

// Get a single project by ID
const project = await projectApi.client.project.get("proj-1");

// Create a new project
const created = await projectApi.client.project.create({
  name: "My Project",
  description: "A new project",
});

// Update a project
const updated = await projectApi.client.project.update("proj-1", {
  status: "archived",
});

// Delete a project
await projectApi.client.project.delete("proj-1");
```

### Step 5 -- Use Query Keys for Cache Management

The contract also generates TanStack Query key factories.

```ts
projectApi.queryKeys.project.all;
// → ["project", "project"]

projectApi.queryKeys.project.lists();
// → ["project", "project", "list"]

projectApi.queryKeys.project.list({ status: "active" });
// → ["project", "project", "list", { status: "active" }]

projectApi.queryKeys.project.details();
// → ["project", "project", "detail"]

projectApi.queryKeys.project.detail("proj-1");
// → ["project", "project", "detail", "proj-1"]
```

## Variations

### Adding a Filter Schema

Use `filterSchema` to validate list query filters at the type level.

```ts
const projectEntity = {
  path: "/projects",
  schema: projectSchema,
  createSchema: createProjectSchema,
  updateSchema: updateProjectSchema,
  filterSchema: z.object({
    status: z.enum(["active", "archived"]).optional(),
    search: z.string().optional(),
  }),
} satisfies EntityDefinition;
```

### Multiple Entities in One Contract

A single contract can hold as many entities as needed.

```ts
const projectApi = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    project: {
      path: "/projects",
      schema: projectSchema,
      createSchema: createProjectSchema,
      updateSchema: updateProjectSchema,
    },
    task: {
      path: "/tasks",
      schema: taskSchema,
      createSchema: createTaskSchema,
      updateSchema: updateTaskSchema,
    },
  },
  queryBuilder: simpleQueryBuilder,
});

// Both entities are available on the client
await projectApi.client.project.list();
await projectApi.client.task.list();
```

### Using a Custom Fetch Function

Replace the built-in HTTP client with a custom implementation (e.g., to add auth headers).

```ts
const projectApi = defineApi(
  {
    domain: "project",
    basePath: "/api/v1",
    entities: { project: projectEntity },
    queryBuilder: simpleQueryBuilder,
  },
  {
    fetchFn: async (path, options) => {
      const res = await fetch(path, {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data ?? json;
    },
  },
);
```

## Related

- [Parent-Child Entity Relationships](./parent-child.md) -- nested URL construction with `EntityParent`
- [Custom Operations Beyond CRUD](./custom-operations.md) -- non-CRUD endpoints with `OperationDefinition`
