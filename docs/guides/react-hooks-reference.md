# How to Use React Query Hooks with @simplix-react/react

> Derive type-safe React Query hooks from an API contract and use them for list, detail, create, update, delete, and infinite scroll operations with automatic cache invalidation.

## Before You Begin

- A simplix-react project with a contract defined using `@simplix-react/contract`
- Install dependencies:

```bash
pnpm add @simplix-react/react @tanstack/react-query
```

- Peer dependencies:

| Package | Version |
| --- | --- |
| `@simplix-react/contract` | workspace |
| `@tanstack/react-query` | >= 5.0.0 |
| `react` | >= 18.0.0 |
| `zod` | >= 4.0.0 |

- An existing contract:

```ts
// contract.ts
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";
import { z } from "zod";

export const projectContract = defineApi({
  domain: "project",
  basePath: "/api",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({
        id: z.string(),
        title: z.string(),
        status: z.enum(["open", "in_progress", "done"]),
        priority: z.number(),
        createdAt: z.string(),
      }),
      createSchema: z.object({
        title: z.string(),
        status: z.enum(["open", "in_progress", "done"]),
        priority: z.number(),
      }),
      updateSchema: z.object({
        title: z.string().optional(),
        status: z.enum(["open", "in_progress", "done"]).optional(),
        priority: z.number().optional(),
      }),
    },
  },
  queryBuilder: simpleQueryBuilder,
});
```

## Solution

### Step 1 -- Derive Hooks from a Contract

Call `deriveEntityHooks` with your contract. This generates a complete set of React Query hooks for every entity and operation in a single call.

```ts
import { deriveEntityHooks } from "@simplix-react/react";
import { projectContract } from "./contract.js";

export const hooks = deriveEntityHooks(projectContract);

// hooks.task.useList        -- list query
// hooks.task.useGet         -- detail query
// hooks.task.useCreate      -- create mutation
// hooks.task.useUpdate      -- update mutation
// hooks.task.useDelete      -- delete mutation
// hooks.task.useInfiniteList -- infinite scroll query
```

The return type is `DerivedEntityHooksResult`, which maps each entity name to an `EntityHooks` object and each top-level operation to an `OperationHooks` object.

### Step 2 -- Fetch a List with useList

`useList` fetches a list of entities. It supports three calling conventions depending on whether the entity has a parent.

**Top-level entity (no parent):**

```tsx
function TaskList() {
  const { data: tasks, isLoading, error } = hooks.task.useList();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {tasks?.map((task) => (
        <li key={task.id}>{task.title} — {task.status}</li>
      ))}
    </ul>
  );
}
```

**With filters and sorting:**

```tsx
const { data: tasks } = hooks.task.useList({
  filters: { status: "open" },
  sort: { field: "createdAt", direction: "desc" },
});
```

**Child entity with parent ID:**

```tsx
// Fetch tasks belonging to a specific project
const { data: tasks } = hooks.task.useList(projectId);

// With filters
const { data: tasks } = hooks.task.useList(projectId, {
  filters: { status: "open" },
  sort: { field: "priority", direction: "asc" },
});

// With filters and query options
const { data: tasks } = hooks.task.useList(
  projectId,
  { filters: { status: "open" } },
  { enabled: isReady },
);
```

For child entities, the query is automatically disabled when `parentId` is falsy.

The `ListParams` type:

```ts
interface ListParams {
  filters?: Record<string, unknown>;
  sort?: { field: string; direction: "asc" | "desc" };
  pagination?: { type: "offset"; page: number; limit: number }
    | { type: "cursor"; cursor: string; limit: number };
}
```

**Signature:**

```ts
type DerivedListHook<TData> = (
  parentIdOrParams?: string | ListParams,
  paramsOrOptions?: ListParams | Omit<UseQueryOptions<TData[], Error>, "queryKey" | "queryFn">,
  options?: Omit<UseQueryOptions<TData[], Error>, "queryKey" | "queryFn">,
) => UseQueryResult<TData[]>;
```

### Step 3 -- Fetch a Single Entity with useGet

`useGet` fetches a single entity by ID. The query is automatically disabled when `id` is falsy.

```tsx
function TaskDetail({ taskId }: { taskId: string }) {
  const { data: task, isLoading } = hooks.task.useGet(taskId);

  if (isLoading) return <p>Loading...</p>;
  if (!task) return <p>Task not found</p>;

  return (
    <div>
      <h2>{task.title}</h2>
      <p>Status: {task.status}</p>
      <p>Priority: {task.priority}</p>
    </div>
  );
}
```

Pass TanStack Query options as the second argument:

```tsx
const { data: task } = hooks.task.useGet(taskId, {
  staleTime: 5000,
  refetchOnWindowFocus: false,
});
```

The `id` parameter accepts either a string or a composite key object (`EntityId`):

```ts
type EntityId = string | Record<string, string>;
```

**Signature:**

```ts
type DerivedGetHook<TData> = (
  id: EntityId,
  options?: Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn">,
) => UseQueryResult<TData>;
```

### Step 4 -- Create an Entity with useCreate

`useCreate` returns a TanStack Query mutation. For child entities, pass the parent ID as the first argument.

```tsx
function CreateTaskForm() {
  const createTask = hooks.task.useCreate();

  async function handleSubmit(values: { title: string; status: string; priority: number }) {
    await createTask.mutateAsync(values);
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(formValues); }}>
      {/* form fields */}
      <button type="submit" disabled={createTask.isPending}>
        {createTask.isPending ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
}
```

For child entities:

```tsx
const createTask = hooks.task.useCreate(projectId);
createTask.mutate({ title: "New task", status: "open", priority: 1 });
```

Pass mutation options as the second argument:

```tsx
const createTask = hooks.task.useCreate(undefined, {
  onSuccess: (data) => {
    console.log("Created:", data);
    navigate(`/tasks/${data.id}`);
  },
  onError: (error) => {
    console.error("Create failed:", error);
  },
});
```

On success, `useCreate` automatically invalidates all queries under the entity's query key scope.

**Signature:**

```ts
type DerivedCreateHook<TInput, TOutput> = (
  parentId?: string,
  options?: Omit<UseMutationOptions<TOutput, Error, TInput>, "mutationFn">,
) => UseMutationResult<TOutput, Error, TInput>;
```

### Step 5 -- Update an Entity with useUpdate

`useUpdate` accepts `{ id, dto }` as mutation variables. It supports optimistic updates.

```tsx
function TaskStatusToggle({ task }: { task: Task }) {
  const updateTask = hooks.task.useUpdate();

  function toggleStatus() {
    const newStatus = task.status === "done" ? "open" : "done";
    updateTask.mutate({ id: task.id, dto: { status: newStatus } });
  }

  return (
    <button onClick={toggleStatus} disabled={updateTask.isPending}>
      {task.status === "done" ? "Reopen" : "Complete"}
    </button>
  );
}
```

**Optimistic updates** -- UI updates instantly, rolls back on error:

```tsx
const updateTask = hooks.task.useUpdate({ optimistic: true });
updateTask.mutate({ id: taskId, dto: { status: "done" } });
```

How optimistic updates work:

1. All entity queries are cancelled via `queryClient.cancelQueries`.
2. List query data is updated in-place with the new values.
3. On error, the previous data is restored from the snapshot.
4. On settlement (success or error), all entity queries are invalidated.

**Signature:**

```ts
type DerivedUpdateHook<TInput, TOutput> = (
  options?: Omit<
    UseMutationOptions<TOutput, Error, { id: EntityId; dto: TInput }>,
    "mutationFn"
  >,
) => UseMutationResult<TOutput, Error, { id: EntityId; dto: TInput }>;
```

### Step 6 -- Delete an Entity with useDelete

`useDelete` accepts the entity ID as the mutation variable.

```tsx
function DeleteTaskButton({ taskId }: { taskId: string }) {
  const deleteTask = hooks.task.useDelete({
    onSuccess: () => navigate("/tasks"),
  });

  return (
    <button
      onClick={() => deleteTask.mutate(taskId)}
      disabled={deleteTask.isPending}
    >
      {deleteTask.isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
```

On success, `useDelete` automatically invalidates all queries under the entity's query key scope.

**Signature:**

```ts
type DerivedDeleteHook = (
  options?: Omit<UseMutationOptions<void, Error, EntityId>, "mutationFn">,
) => UseMutationResult<void, Error, EntityId>;
```

### Step 7 -- Infinite Scrolling with useInfiniteList

`useInfiniteList` supports both cursor-based and offset-based pagination. The next page parameter is determined automatically from the response's `meta` field.

```tsx
function InfiniteTaskList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = hooks.task.useInfiniteList(undefined, {
    limit: 10,
    filters: { status: "open" },
    sort: { field: "createdAt", direction: "desc" },
  });

  const allTasks = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div>
      <ul>
        {allTasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading more..." : "Load More"}
        </button>
      )}
    </div>
  );
}
```

For child entities, pass the parent ID:

```tsx
const result = hooks.task.useInfiniteList(projectId, {
  limit: 20,
  filters: { status: "in_progress" },
});
```

The expected server response format:

```ts
interface PageResponse<T> {
  data: T[];
  meta: {
    hasNextPage: boolean;
    nextCursor?: string; // for cursor-based pagination
  };
}
```

**Signature:**

```ts
type DerivedInfiniteListHook<TData> = (
  parentId?: string,
  params?: Omit<ListParams, "pagination"> & { limit?: number },
  options?: Record<string, unknown>,
) => UseInfiniteQueryResult<{ data: TData[]; meta: PageInfo }, Error>;
```

## Variations

### Query Key Structure

Each entity generates a `QueryKeyFactory` with the following structure:

| Key | Shape | Usage |
| --- | --- | --- |
| `keys.all` | `[domain, entity]` | Invalidates all entity queries |
| `keys.lists()` | `[domain, entity, "list"]` | Invalidates all list queries |
| `keys.list(params)` | `[domain, entity, "list", params]` | Specific filtered list |
| `keys.detail(id)` | `[domain, entity, "detail", id]` | Specific entity by ID |
| `keys.tree(params)` | `[domain, entity, "tree", params]` | Tree query |

For the contract example above, query keys look like:

```ts
// All task queries
["project", "task"]

// All task list queries
["project", "task", "list"]

// Filtered task list
["project", "task", "list", { status: "open" }]

// Specific task
["project", "task", "detail", "task-1"]
```

### Auto-Invalidation Behavior

Mutation hooks automatically invalidate related queries:

| Hook | Invalidation Scope | Timing |
| --- | --- | --- |
| `useCreate` | `keys.all` (all entity queries) | On success |
| `useUpdate` | `keys.all` (all entity queries) | On settlement (success or error) |
| `useDelete` | `keys.all` (all entity queries) | On success |

No manual `queryClient.invalidateQueries()` calls are needed for standard CRUD operations.

### TanStack Query Options Passthrough

All hooks accept TanStack Query options as their last argument. Query hooks accept all `UseQueryOptions` except `queryKey` and `queryFn`. Mutation hooks accept all `UseMutationOptions` except `mutationFn`.

```ts
// Disable a query
const { data } = hooks.task.useList({ enabled: false });

// Custom stale time
const { data } = hooks.task.useGet(taskId, { staleTime: 30_000 });

// Mutation callbacks
const createTask = hooks.task.useCreate(undefined, {
  onSuccess: (data) => console.log("Created:", data),
  onError: (error) => console.error("Failed:", error),
  onSettled: () => console.log("Done"),
});
```

### Custom Operation Hooks

Operations defined in the contract with non-CRUD methods produce generic hooks:

- **GET operations** produce query hooks
- **POST/PUT/PATCH/DELETE operations** produce mutation hooks

```ts
const contract = defineApi({
  domain: "inventory",
  basePath: "/api",
  entities: {
    product: {
      path: "/products",
      schema: productSchema,
      operations: {
        list: { method: "GET", path: "/products" },
        get: { method: "GET", path: "/products/:id" },
        create: { method: "POST", path: "/products", input: createSchema },
        archive: { method: "POST", path: "/products/:id/archive" },
        search: { method: "GET", path: "/products/search" },
      },
    },
  },
});

const hooks = deriveEntityHooks(contract);

// Custom mutation hook (POST)
const archive = hooks.product.useArchive();
archive.mutate(productId);

// Custom query hook (GET)
const { data } = hooks.product.useSearch({ q: "keyword" });
```

### Top-Level Operation Hooks

Operations defined at the contract root (not under an entity) produce `OperationHooks` with a `useMutation` method:

```ts
const archiveProject = hooks.archiveProject.useMutation({
  onSuccess: () => console.log("Project archived"),
});

archiveProject.mutate({ projectId: "abc" });
```

Custom `invalidates` functions defined in the operation contract determine which query keys to invalidate on success.

### Paginated List Unwrapping

`useList` automatically unwraps paginated responses. If the server returns `{ data: T[] }`, the hook extracts and returns just the array:

```ts
// Server returns: { data: [{ id: "1", ... }], meta: { total: 100 } }
// useList returns: [{ id: "1", ... }]
const { data: tasks } = hooks.task.useList();
```

## Related

- [Defining Entities in a Contract](./defining-entities.md) -- Setting up entity schemas
- [Form Hooks Guide](./form-hooks.md) -- Derive TanStack Form hooks for create/update forms
- [Custom Operations](./custom-operations.md) -- Defining non-CRUD operations in contracts
- [@simplix-react/react API Reference](../api/@simplix-react/react/README.md) -- Full API documentation
