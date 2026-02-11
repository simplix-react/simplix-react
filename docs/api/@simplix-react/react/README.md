[**Documentation**](../../README.md)

***

[Documentation](../../README.md) / @simplix-react/react

# @simplix-react/react

Type-safe React Query hooks derived automatically from an `@simplix-react/contract` API contract.

> **Prerequisites:** Requires a contract defined with `@simplix-react/contract`.

## Installation

```bash
pnpm add @simplix-react/react
```

**Peer dependencies:**

| Package | Version |
| --- | --- |
| `@simplix-react/contract` | workspace |
| `@tanstack/react-query` | >= 5.0.0 |
| `react` | >= 18.0.0 |
| `zod` | >= 4.0.0 |

## Quick Example

```ts
import { defineApi } from "@simplix-react/contract";
import { deriveHooks } from "@simplix-react/react";
import { z } from "zod";

// 1. Define the contract
const projectContract = defineApi({
  domain: "project",
  basePath: "/api",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({ id: z.string(), title: z.string(), status: z.string() }),
      createSchema: z.object({ title: z.string(), status: z.string() }),
      updateSchema: z.object({ title: z.string().optional(), status: z.string().optional() }),
    },
  },
});

// 2. Derive hooks — one call generates everything
const hooks = deriveHooks(projectContract);

// 3. Use in components
function TaskList() {
  const { data: tasks, isLoading } = hooks.task.useList();
  const createTask = hooks.task.useCreate();

  if (isLoading) return <p>Loading...</p>;

  return (
    <ul>
      {tasks?.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
}
```

## API Overview

The package exports a single function and a set of type definitions:

| Export | Kind | Description |
| --- | --- | --- |
| `deriveHooks` | Function | Derives all hooks from a contract |
| `EntityHooks` | Type | Hook interface for a single entity |
| `OperationHooks` | Type | Hook interface for a custom operation |
| `DerivedListHook` | Type | List query hook signature |
| `DerivedGetHook` | Type | Detail query hook signature |
| `DerivedCreateHook` | Type | Create mutation hook signature |
| `DerivedUpdateHook` | Type | Update mutation hook signature |
| `DerivedDeleteHook` | Type | Delete mutation hook signature |
| `DerivedInfiniteListHook` | Type | Infinite list query hook signature |
| `OperationMutationHook` | Type | Operation mutation hook signature |

## Key Concepts

### Hook Derivation

`deriveHooks()` reads the entity and operation definitions from a contract and generates a typed hook object. Each entity key maps to an `EntityHooks` object, and each operation key maps to an `OperationHooks` object.

```ts
const hooks = deriveHooks(projectContract);
// hooks.task    → EntityHooks<TaskSchema, CreateTaskSchema, UpdateTaskSchema>
// hooks.archiveProject → OperationHooks<ArchiveInput, ArchiveOutput>
```

### Auto-Invalidation

Mutation hooks automatically invalidate related queries:

- **Entity mutations** (`useCreate`, `useUpdate`, `useDelete`) invalidate all queries under the entity's query key scope.
- **Operation mutations** invalidate based on the `invalidates` function defined in the operation's contract configuration.

No manual `queryClient.invalidateQueries()` calls are needed.

### TanStack Query Options Passthrough

All hooks accept TanStack Query options as their last argument. Query hooks accept all `UseQueryOptions` except `queryKey` and `queryFn`. Mutation hooks accept all `UseMutationOptions` except `mutationFn`.

```ts
// Pass query options
const { data } = hooks.task.useList({ enabled: false });

// Pass mutation options
const createTask = hooks.task.useCreate(undefined, {
  onSuccess: (data) => console.log("Created:", data),
});
```

## Hook Reference

### `useList`

Fetches a list of entities. Supports three calling conventions:

```ts
// Top-level entity
hooks.task.useList();
hooks.task.useList({ enabled: isReady });

// With filters/sort
hooks.task.useList({
  filters: { status: "open" },
  sort: { field: "createdAt", direction: "desc" },
});

// Child entity with parent ID
hooks.task.useList(projectId);
hooks.task.useList(projectId, { filters: { status: "open" } });
hooks.task.useList(projectId, { filters: { status: "open" } }, { enabled: isReady });
```

For child entities, the query is automatically disabled when `parentId` is falsy.

### `useGet`

Fetches a single entity by ID.

```ts
const { data: task } = hooks.task.useGet(taskId);
const { data: task } = hooks.task.useGet(taskId, { staleTime: 5000 });
```

The query is automatically disabled when `id` is falsy.

### `useCreate`

Creates a new entity. For child entities, pass the parent ID.

```ts
// Top-level entity
const createTask = hooks.task.useCreate();
createTask.mutate({ title: "New task", status: "open" });

// Child entity
const createTask = hooks.task.useCreate(projectId);
createTask.mutate({ title: "New task", status: "open" });
```

### `useUpdate`

Updates an existing entity. Supports optimistic updates.

```ts
// Standard update
const updateTask = hooks.task.useUpdate();
updateTask.mutate({ id: taskId, dto: { status: "done" } });

// Optimistic update — UI updates instantly, rolls back on error
const updateTask = hooks.task.useUpdate({ optimistic: true });
updateTask.mutate({ id: taskId, dto: { status: "done" } });
```

### `useDelete`

Deletes an entity by ID.

```ts
const deleteTask = hooks.task.useDelete();
deleteTask.mutate(taskId);
```

### `useInfiniteList`

Fetches paginated data with cursor-based or offset-based pagination. Pagination is managed automatically based on the response's `meta` field.

```ts
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = hooks.task.useInfiniteList(projectId, {
  limit: 10,
  filters: { status: "open" },
  sort: { field: "createdAt", direction: "desc" },
});

// Access flattened data
const allTasks = data?.pages.flatMap((page) => page.data) ?? [];
```

### Operation `useMutation`

Custom operations defined in the contract each produce a `useMutation` hook.

```ts
const archiveProject = hooks.archiveProject.useMutation({
  onSuccess: () => {
    // Cache invalidation is already handled via the contract's `invalidates`
    console.log("Project archived");
  },
});

archiveProject.mutate({ projectId: "abc" });
```

## Related Packages

| Package | Description |
| --- | --- |
| `@simplix-react/contract` | Define type-safe API contracts |
| `@simplix-react/mock` | Generate MSW handlers from contracts for testing |
| `@simplix-react/i18n` | i18next-based internationalization framework |

---

Next Step → `@simplix-react/mock`

## Interfaces

- [EntityHooks](interfaces/EntityHooks.md)
- [OperationHooks](interfaces/OperationHooks.md)

## Type Aliases

- [DerivedCreateHook](type-aliases/DerivedCreateHook.md)
- [DerivedDeleteHook](type-aliases/DerivedDeleteHook.md)
- [DerivedGetHook](type-aliases/DerivedGetHook.md)
- [DerivedInfiniteListHook](type-aliases/DerivedInfiniteListHook.md)
- [DerivedListHook](type-aliases/DerivedListHook.md)
- [DerivedUpdateHook](type-aliases/DerivedUpdateHook.md)
- [OperationMutationHook](type-aliases/OperationMutationHook.md)

## Functions

- [deriveHooks](functions/deriveHooks.md)
