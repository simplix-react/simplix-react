# Defining Custom Operations Beyond CRUD

> Add non-CRUD endpoints (batch actions, RPC calls, file uploads) to your contract using `OperationDefinition`.

## Before You Begin

- Know how to [define entities in a contract](./defining-entities.md)
- Understand the difference between CRUD entity methods and custom operations

Standard entity definitions cover `list`, `get`, `create`, `update`, and `delete`. For anything outside that pattern -- assigning a task, archiving a project, exporting a report -- use an `OperationDefinition`.

## Solution

### Step 1 -- Define the Operation

An `OperationDefinition` specifies the HTTP method, path, input schema, and output schema.

```ts
import { z } from "zod";
import type { OperationDefinition } from "@simplix-react/contract";

const assignTask = {
  method: "POST",
  path: "/tasks/:taskId/assign",
  input: z.object({
    userId: z.string().uuid(),
  }),
  output: z.object({
    id: z.string().uuid(),
    title: z.string(),
    assigneeId: z.string().uuid(),
  }),
} satisfies OperationDefinition;
```

Path parameters use the `:paramName` syntax. They are positionally mapped to function arguments when calling the derived client.

### Step 2 -- Register in the Contract

Add the operation to the `operations` field alongside your entities.

```ts
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";

const projectApi = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    project: projectEntity,
    task: taskEntity,
  },
  operations: {
    assignTask,
  },
  queryBuilder: simpleQueryBuilder,
});
```

### Step 3 -- Call the Derived Client

The operation client accepts path parameters as positional arguments, followed by the input payload.

```ts
// POST /api/v1/tasks/task-1/assign
// Body: { "userId": "user-42" }
const result = await projectApi.client.assignTask("task-1", {
  userId: "user-42",
});
// result: { id: "task-1", title: "...", assigneeId: "user-42" }
```

For operations with multiple path parameters, each is passed in order:

```ts
const transferTask = {
  method: "POST",
  path: "/projects/:projectId/tasks/:taskId/transfer",
  input: z.object({ targetProjectId: z.string() }),
  output: z.object({ id: z.string(), projectId: z.string() }),
} satisfies OperationDefinition;

// Path params are positional: projectId, taskId, then the input body
await projectApi.client.transferTask("proj-1", "task-1", {
  targetProjectId: "proj-2",
});
```

### Step 4 -- Use Derived Hooks

Operations produce a `useMutation` hook in `@simplix-react/react`.

```tsx
import { deriveHooks } from "@simplix-react/react";

const hooks = deriveHooks(projectApi);

function AssignButton({ taskId }: { taskId: string }) {
  const { mutate, isPending } = hooks.assignTask.useMutation();

  return (
    <button
      disabled={isPending}
      onClick={() => mutate({ taskId, userId: "user-42" })}
    >
      {isPending ? "Assigning..." : "Assign"}
    </button>
  );
}
```

### Step 5 -- Add Cache Invalidation

Use the `invalidates` callback to automatically invalidate relevant queries after the operation succeeds.

```ts
const assignTask = {
  method: "POST",
  path: "/tasks/:taskId/assign",
  input: z.object({
    userId: z.string().uuid(),
  }),
  output: z.object({
    id: z.string().uuid(),
    title: z.string(),
    assigneeId: z.string().uuid(),
  }),
  invalidates: (queryKeys, _params) => [
    queryKeys.task.all,  // Invalidate all task queries
  ],
} satisfies OperationDefinition;
```

The `invalidates` function receives:
- `queryKeys` -- a record of all entity query key factories in the contract
- `params` -- the resolved path parameters from the request

After the mutation succeeds, the framework automatically calls `queryClient.invalidateQueries` for each returned key array.

## Variations

### GET Operations (Queries Instead of Mutations)

Operations with `method: "GET"` still derive a `useMutation` hook. If you need a query-style hook, use the client directly with `useQuery`.

```ts
import { useQuery } from "@tanstack/react-query";

const exportReport = {
  method: "GET",
  path: "/projects/:projectId/report",
  input: z.object({}),
  output: z.object({
    summary: z.string(),
    totalTasks: z.number(),
  }),
} satisfies OperationDefinition;

// Manual query hook usage
function useProjectReport(projectId: string) {
  return useQuery({
    queryKey: ["project", "report", projectId],
    queryFn: () => projectApi.client.exportReport(projectId),
  });
}
```

### File Uploads with Multipart

Set `contentType: "multipart"` to send `FormData` instead of JSON.

```ts
const uploadAttachment = {
  method: "POST",
  path: "/tasks/:taskId/attachments",
  input: z.object({
    file: z.instanceof(File),
    description: z.string().optional(),
  }),
  output: z.object({
    id: z.string(),
    url: z.string().url(),
    filename: z.string(),
  }),
  contentType: "multipart",
} satisfies OperationDefinition;
```

The framework automatically converts the input object to `FormData`, appending `File`/`Blob` values and stringifying primitives.

```tsx
function FileUploadButton({ taskId }: { taskId: string }) {
  const upload = hooks.uploadAttachment.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      upload.mutate({ taskId, file, description: "Screenshot" });
    }
  };

  return <input type="file" onChange={handleFileChange} />;
}
```

### Blob Responses (File Downloads)

Set `responseType: "blob"` to receive binary data.

```ts
const downloadReport = {
  method: "GET",
  path: "/projects/:projectId/export",
  input: z.object({}),
  output: z.instanceof(Blob),
  responseType: "blob",
} satisfies OperationDefinition;

// Usage
const blob = await projectApi.client.downloadReport("proj-1");
const url = URL.createObjectURL(blob);
```

### Targeted Cache Invalidation

Invalidate specific query subsets using the query key factory methods.

```ts
const archiveProject = {
  method: "POST",
  path: "/projects/:projectId/archive",
  input: z.object({}),
  output: z.object({ id: z.string(), status: z.literal("archived") }),
  invalidates: (queryKeys, _params) => [
    queryKeys.project.lists(),   // Invalidate all project list queries
    queryKeys.task.all,          // Invalidate all task queries (children too)
  ],
} satisfies OperationDefinition;
```

Available query key granularity:

| Method | Key | Scope |
| --- | --- | --- |
| `.all` | `[domain, entity]` | All queries for this entity |
| `.lists()` | `[domain, entity, "list"]` | All list queries |
| `.list(params)` | `[domain, entity, "list", params]` | Specific filtered list |
| `.details()` | `[domain, entity, "detail"]` | All detail queries |
| `.detail(id)` | `[domain, entity, "detail", id]` | Specific detail query |

### All Supported HTTP Methods

The `method` field accepts: `"GET"`, `"POST"`, `"PUT"`, `"PATCH"`, `"DELETE"`.

```ts
// PUT -- full replacement
const replaceConfig = {
  method: "PUT",
  path: "/projects/:projectId/config",
  input: z.object({ theme: z.string(), locale: z.string() }),
  output: z.object({ theme: z.string(), locale: z.string() }),
} satisfies OperationDefinition;

// DELETE -- custom delete with body
const bulkDelete = {
  method: "DELETE",
  path: "/tasks/bulk",
  input: z.object({ ids: z.array(z.string()) }),
  output: z.object({ deletedCount: z.number() }),
} satisfies OperationDefinition;

// PATCH -- partial update on a sub-resource
const updateSettings = {
  method: "PATCH",
  path: "/projects/:projectId/settings",
  input: z.object({ notifications: z.boolean().optional() }),
  output: z.object({ notifications: z.boolean() }),
} satisfies OperationDefinition;
```

## Related

- [Defining Entities in a Contract](./defining-entities.md) -- standard CRUD entity setup
- [Parent-Child Entity Relationships](./parent-child.md) -- nested URL construction with `EntityParent`
