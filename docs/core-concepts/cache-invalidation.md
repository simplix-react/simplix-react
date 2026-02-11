# Cache Invalidation

## Overview

Cache invalidation in simplix-react is automatic and convention-driven. When a mutation succeeds (create, update, or delete), the framework invalidates the appropriate TanStack Query cache entries without requiring any manual intervention from the developer. This behavior is built into the derived hooks and driven by the query key structure.

The fundamental problem that cache invalidation solves is ensuring that data displayed in the UI stays consistent with the server after mutations. Without automatic invalidation, developers must manually specify which queries to refetch after every mutation --- a process that is tedious, error-prone, and frequently forgotten. simplix-react eliminates this burden by encoding invalidation rules into the derivation pipeline itself.

The strategy is deliberately conservative: mutations invalidate broadly rather than surgically. When a task is updated, all task queries (both lists and details) are marked as stale, not just the specific list or detail that contains the changed item. This simplicity trades a small amount of unnecessary refetching for a guarantee that the UI never shows stale data.

## How It Works

### Query Key Structure

Every query key in simplix-react follows a hierarchical structure rooted in the contract's `domain` and the entity name:

```
[domain, entityName]                          // all (root)
[domain, entityName, "list"]                  // all lists
[domain, entityName, "list", { ...params }]   // specific list with filters
[domain, entityName, "detail"]                // all details
[domain, entityName, "detail", id]            // specific detail by ID
```

For example, with `domain: "project"` and an entity named `task`:

```ts
queryKeys.task.all              // ["project", "task"]
queryKeys.task.lists()          // ["project", "task", "list"]
queryKeys.task.list({ status: "open" })
                                // ["project", "task", "list", { status: "open" }]
queryKeys.task.details()        // ["project", "task", "detail"]
queryKeys.task.detail("abc-123")
                                // ["project", "task", "detail", "abc-123"]
```

This hierarchy is critical because TanStack Query's `invalidateQueries` uses prefix matching by default. Invalidating `["project", "task"]` matches every key that starts with those two segments --- which includes all lists and all details for that entity.

### Entity Mutation Invalidation

The derived entity hooks (`useCreate`, `useUpdate`, `useDelete`) all invalidate using `keys.all` --- the root key for the entity:

```ts
// useCreate - invalidates on success
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: keys.all });
}

// useUpdate - invalidates on settlement (success or error)
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: keys.all });
}

// useDelete - invalidates on success
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: keys.all });
}
```

This means that after any mutation on an entity, **all queries for that entity** are marked as stale and will refetch the next time a component observes them.

### Optimistic Updates

The `useUpdate` hook supports an `optimistic` mode that provides instant UI feedback before the server responds:

```ts
const updateTask = hooks.task.useUpdate({ optimistic: true });
updateTask.mutate({ id: taskId, dto: { status: "done" } });
```

When optimistic mode is enabled, the mutation lifecycle follows this sequence:

1. **onMutate** --- cancels in-flight queries for the entity, snapshots all list data, and optimistically patches the matching item in every list cache
2. **onError** --- rolls back all list caches to their snapshots
3. **onSettled** --- invalidates `keys.all` regardless of success or failure, triggering a refetch to reconcile with the server

This ensures that the UI updates immediately, but the final state always reflects the server's response.

### Operation Invalidation

Custom operations use a declarative `invalidates` function defined in the contract:

```ts
const assignTask = {
  method: "POST",
  path: "/tasks/:taskId/assign",
  input: z.object({ userId: z.string() }),
  output: z.object({ id: z.string(), assigneeId: z.string() }),
  invalidates: (queryKeys, params) => [
    queryKeys.task.all,
  ],
};
```

The `invalidates` function receives all query key factories and the resolved path parameters, and returns an array of query keys to invalidate. The derived `useMutation` hook calls this function after a successful mutation:

```ts
onSuccess: () => {
  if (operation.invalidates) {
    const keysToInvalidate = operation.invalidates(allQueryKeys, {});
    for (const key of keysToInvalidate) {
      queryClient.invalidateQueries({ queryKey: key });
    }
  }
}
```

This gives operations fine-grained control over cross-entity invalidation. An operation that modifies both tasks and projects can invalidate both:

```ts
invalidates: (queryKeys) => [
  queryKeys.task.all,
  queryKeys.project.all,
],
```

### Parent-Child Key Relationships

When entities have parent relationships, the query key for list queries includes the parent ID in the params object:

```ts
// task has parent: { param: "projectId", path: "/projects" }
hooks.task.useList("project-1");
// query key: ["project", "task", "list", { projectId: "project-1" }]

hooks.task.useList("project-2");
// query key: ["project", "task", "list", { projectId: "project-2" }]
```

Because invalidation targets `keys.all` (which is `["project", "task"]`), a mutation on any task invalidates task lists for **all** parent scopes. This is intentional --- it is safer to over-invalidate than to miss a stale cache entry. If a task is moved from one project to another, both project's task lists need to refetch.

## Design Decisions

### Why Broad Invalidation Over Surgical Updates

A surgical approach would update only the specific cache entries affected by a mutation (e.g. update just the one list that contains the changed item, or patch the detail cache for the specific ID). While more efficient, surgical invalidation is fragile:

- It requires knowing which lists contain the mutated item (which depends on filter parameters)
- It breaks when the mutation changes fields that affect sort order or filter inclusion
- It creates subtle bugs when new list queries are added but the invalidation logic is not updated

Broad invalidation (`keys.all`) is correct by default. The cost --- a few extra refetches --- is negligible in most applications, especially since TanStack Query deduplicates concurrent requests and only refetches queries that are actively observed by mounted components.

### Why Optimistic Updates Are Opt-In

Optimistic updates add complexity (snapshot management, rollback logic, reconciliation). They are valuable for high-frequency interactions where perceived latency matters, but unnecessary for most CRUD operations. Making them opt-in (`{ optimistic: true }`) keeps the default path simple while providing the capability for use cases that need it.

### Why Operations Declare Their Invalidation Targets

Entity mutations have predictable invalidation targets (the entity itself), so the framework can handle them automatically. Operations, however, may affect any combination of entities, and only the developer knows which ones. Rather than guessing, the framework provides the `invalidates` function as a declarative escape hatch.

This keeps the contract as the single source of truth --- invalidation rules live alongside the operation definition, not scattered across component code.

## Implications

### For UI Consistency

Developers do not need to think about cache invalidation for standard CRUD operations. The derived hooks handle it automatically. After a `useCreate` mutation succeeds, any mounted `useList` or `useGet` component for that entity will show up-to-date data without explicit refetch calls.

### For Performance

Broad invalidation means some unnecessary refetches may occur. In practice, this is rarely a problem because:

- TanStack Query only refetches queries that are actively observed (have mounted components)
- Stale queries are refetched in the background, so the UI shows cached data immediately while the refetch happens
- Network requests are deduplicated

### For Custom Operations

Operations that cross entity boundaries (e.g. "archive project" which also affects tasks) must declare their invalidation targets explicitly via the `invalidates` function. This is the one place where developers must reason about cache invalidation, but the framework provides the query key factories to make it straightforward.
