# Setting Up Parent-Child Entity Relationships

> Configure nested entity hierarchies so that child resources are scoped under their parent's URL path (e.g., `/projects/:projectId/tasks`).

## Before You Begin

- Know how to [define a basic entity](./defining-entities.md)
- Have a parent entity (e.g., `project`) already defined in your contract

## Solution

### Step 1 -- Define the Parent Entity

The parent entity is a standard entity definition with no special configuration.

```ts
import { z } from "zod";

const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.enum(["active", "archived"]),
  createdAt: z.string().datetime(),
});

const createProjectSchema = z.object({
  name: z.string().min(1),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["active", "archived"]).optional(),
});
```

### Step 2 -- Define the Child Entity with `parent`

Add the `parent` field to the child entity. This tells the framework how to construct nested URLs.

```ts
const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: z.enum(["todo", "in_progress", "done"]),
  projectId: z.string().uuid(),
  createdAt: z.string().datetime(),
});

const createTaskSchema = z.object({
  title: z.string().min(1),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
});

const taskEntity = {
  path: "/tasks",
  schema: taskSchema,
  createSchema: createTaskSchema,
  updateSchema: updateTaskSchema,
  parent: {
    param: "projectId",    // Route parameter name
    path: "/projects",     // Parent's URL segment
  },
};
```

The `parent` configuration produces the URL pattern:

```
basePath + parent.path + /:param + path
/api/v1  + /projects   + /:projectId + /tasks
→ /api/v1/projects/:projectId/tasks
```

### Step 3 -- Register Both Entities

```ts
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";

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
    task: taskEntity,
  },
  queryBuilder: simpleQueryBuilder,
});
```

### Step 4 -- Use the Client with Parent ID

For child entities, pass the parent ID as the first argument to `list` and `create`.

```ts
const projectId = "proj-1";

// List tasks under a project
// GET /api/v1/projects/proj-1/tasks
const tasks = await projectApi.client.task.list(projectId);

// Create a task under a project
// POST /api/v1/projects/proj-1/tasks
const newTask = await projectApi.client.task.create(projectId, {
  title: "Implement feature",
});

// Get, update, and delete use the task's own ID (no parent needed)
// GET /api/v1/tasks/task-1
const task = await projectApi.client.task.get("task-1");

// PATCH /api/v1/tasks/task-1
const updated = await projectApi.client.task.update("task-1", {
  status: "done",
});

// DELETE /api/v1/tasks/task-1
await projectApi.client.task.delete("task-1");
```

### Step 5 -- Query Key Propagation

When a parent ID is provided, it is automatically included in query keys for proper cache scoping.

```ts
// Query key for all tasks under a specific project:
projectApi.queryKeys.task.list({ projectId: "proj-1" });
// → ["project", "task", "list", { projectId: "proj-1" }]

// Invalidating all task queries regardless of parent:
projectApi.queryKeys.task.all;
// → ["project", "task"]
```

### Step 6 -- Use Derived Hooks with Parent ID

When using `@simplix-react/react`, pass the parent ID to query and mutation hooks.

```tsx
import { deriveHooks } from "@simplix-react/react";

const hooks = deriveHooks(projectApi);

function TaskList({ projectId }: { projectId: string }) {
  // useList automatically includes projectId in the query key
  // and scopes the request to /api/v1/projects/:projectId/tasks
  const { data: tasks, isLoading } = hooks.task.useList(projectId);

  // useCreate takes parentId to POST under the correct parent
  const createTask = hooks.task.useCreate(projectId);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <ul>
        {tasks?.map((task) => (
          <li key={task.id}>{task.title} - {task.status}</li>
        ))}
      </ul>
      <button
        onClick={() =>
          createTask.mutate({ title: "New task", status: "todo" })
        }
      >
        Add Task
      </button>
    </div>
  );
}
```

The `useList` hook automatically disables itself when `projectId` is falsy (undefined or empty string), preventing requests without a valid parent.

## Variations

### Filtering and Sorting with Parent ID

Combine the parent ID with list parameters for filtered queries.

```ts
// List tasks under a project, filtered and sorted
const { data: tasks } = hooks.task.useList(projectId, {
  filters: { status: "todo" },
  sort: { field: "createdAt", direction: "desc" },
});
```

### Named Query Scopes

Use `queries` on the entity definition to declare reusable parent-based query scopes.

```ts
const taskEntity = {
  path: "/tasks",
  schema: taskSchema,
  createSchema: createTaskSchema,
  updateSchema: updateTaskSchema,
  parent: {
    param: "projectId",
    path: "/projects",
  },
  queries: {
    byProject: {
      parent: "project",
      param: "projectId",
    },
  },
};
```

### Infinite Scrolling with Parent ID

The `useInfiniteList` hook also supports parent-scoped queries.

```tsx
function TaskInfiniteList({ projectId }: { projectId: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
  } = hooks.task.useInfiniteList(projectId, { limit: 20 });

  return (
    <div>
      {data?.pages.map((page) =>
        page.data.map((task) => (
          <div key={task.id}>{task.title}</div>
        )),
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>Load More</button>
      )}
    </div>
  );
}
```

## Related

- [Defining Entities in a Contract](./defining-entities.md) -- basic entity setup
- [Custom Operations Beyond CRUD](./custom-operations.md) -- operations that work alongside parent-child entities
