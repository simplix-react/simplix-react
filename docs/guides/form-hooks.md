# How to Use Form Hooks with @simplix-react/form

> Derive TanStack Form hooks from an existing contract and use them to build create/update forms with automatic dirty-field tracking and server error mapping.

## Before You Begin

- A simplix-react project with at least one domain contract and derived React Query hooks
- Install dependencies:

```bash
pnpm add @simplix-react/form @tanstack/react-form
```

- Familiarity with [TanStack Form basics](https://tanstack.com/form/latest)
- An existing contract and hooks setup:

```ts
// contract.ts
import { defineApi } from "@simplix-react/contract";
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
});

// hooks.ts
import { deriveHooks } from "@simplix-react/react";
import { projectContract } from "./contract.js";

export const projectHooks = deriveHooks(projectContract);
```

## Solution

### Step 1 -- Derive Form Hooks from an Existing Contract

Call `deriveFormHooks` with your contract and the derived query hooks. This produces `useCreateForm` and `useUpdateForm` for every entity in a single call.

```ts
import { deriveFormHooks } from "@simplix-react/form";
import { projectContract } from "./contract.js";
import { projectHooks } from "./hooks.js";

export const projectFormHooks = deriveFormHooks(projectContract, projectHooks);

// projectFormHooks.task.useCreateForm  -- create form hook
// projectFormHooks.task.useUpdateForm  -- update form hook
```

### Step 2 -- Use useCreateForm in a Component

`useCreateForm` returns a TanStack Form instance wired to the entity's create mutation. You pass default values through options, and the form handles submission, error state, and reset automatically.

```tsx
import { projectFormHooks } from "./form-hooks.js";

function CreateTaskForm({ projectId }: { projectId: string }) {
  const { form, isSubmitting, submitError, reset } = projectFormHooks.task.useCreateForm(
    projectId,
    {
      defaultValues: { title: "", status: "open", priority: 0 },
      resetOnSuccess: true,
      onSuccess: (data) => {
        console.log("Task created:", data);
      },
    },
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="title">
        {(field) => (
          <div>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errorMap.onSubmit && (
              <p role="alert">{field.state.meta.errorMap.onSubmit}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="status">
        {(field) => (
          <div>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        )}
      </form.Field>

      <form.Field name="priority">
        {(field) => (
          <div>
            <label htmlFor="priority">Priority</label>
            <input
              id="priority"
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
            />
          </div>
        )}
      </form.Field>

      {submitError && <p role="alert">{submitError.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Task"}
      </button>
      <button type="button" onClick={reset}>
        Reset
      </button>
    </form>
  );
}
```

Key behaviors:

| Behavior | Default | Override |
| --- | --- | --- |
| Form resets after success | `true` | `resetOnSuccess: false` |
| Server 422 errors mapped to fields | Always | -- |
| Query cache invalidation | Automatic | -- |

### Step 3 -- Use useUpdateForm with Dirty-Field Tracking

`useUpdateForm` fetches the existing entity, populates the form, and on submit sends only the fields that changed. This produces minimal PATCH payloads automatically.

```tsx
import { projectFormHooks } from "./form-hooks.js";

function EditTaskForm({ taskId }: { taskId: string }) {
  const { form, isLoading, isSubmitting, submitError, entity } =
    projectFormHooks.task.useUpdateForm(taskId, {
      dirtyOnly: true,
      onSuccess: (data) => {
        console.log("Task updated:", data);
      },
    });

  if (isLoading) return <p>Loading task...</p>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="title">
        {(field) => (
          <div>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errorMap.onSubmit && (
              <p role="alert">{field.state.meta.errorMap.onSubmit}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="status">
        {(field) => (
          <div>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        )}
      </form.Field>

      <form.Field name="priority">
        {(field) => (
          <div>
            <label htmlFor="priority">Priority</label>
            <input
              id="priority"
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
            />
          </div>
        )}
      </form.Field>

      {submitError && <p role="alert">{submitError.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
```

How dirty-field tracking works:

1. The hook fetches entity data via `useGet(entityId)` and populates the form.
2. On submit, `extractDirtyFields(currentValues, originalEntity)` runs a deep comparison.
3. Only changed fields are sent in the mutation payload (`{ id, dto: dirtyFields }`).
4. When server data changes (e.g., after a background refetch), the form resets to match.

Set `dirtyOnly: false` to send all fields regardless of changes:

```ts
const { form } = projectFormHooks.task.useUpdateForm(taskId, {
  dirtyOnly: false,
});
```

### Step 4 -- Handle Server Validation Errors

When the server returns a 422 response, form hooks automatically map field errors to the TanStack Form instance. You can also use `mapServerErrorsToForm` directly for custom mutation flows.

**Automatic handling (built into form hooks):**

Server 422 errors are parsed and set on each field's `errorMap.onSubmit` slot automatically. You display them in your field render functions:

```tsx
<form.Field name="title">
  {(field) => (
    <div>
      <input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.errorMap.onSubmit && (
        <p role="alert">{field.state.meta.errorMap.onSubmit}</p>
      )}
    </div>
  )}
</form.Field>
```

**Manual handling for custom flows:**

Use `mapServerErrorsToForm` directly when you manage mutations outside of form hooks:

```ts
import { mapServerErrorsToForm } from "@simplix-react/form";

async function handleCustomSubmit(form: AnyFormApi) {
  try {
    await customMutation.mutateAsync(form.state.values);
  } catch (error) {
    mapServerErrorsToForm(error, form);
  }
}
```

Supported server error formats:

| Format | Shape | Example |
| --- | --- | --- |
| Rails | `{ errors: { [field]: string[] } }` | `{ errors: { title: ["can't be blank"] } }` |
| JSON:API | `{ errors: [{ field, message }] }` | `{ errors: [{ field: "title", message: "can't be blank" }] }` |

Non-422 errors and non-`ApiError` instances are silently ignored by the mapper.

## Variations

### Using extractDirtyFields Standalone

You can use `extractDirtyFields` outside of form hooks for any diff-based PATCH logic:

```ts
import { extractDirtyFields } from "@simplix-react/form";

const original = { title: "Old", status: "open", priority: 1 };
const current = { title: "New", status: "open", priority: 3 };

const patch = extractDirtyFields(current, original);
// => { title: "New", priority: 3 }

await api.client.task.update(taskId, patch);
```

### Top-Level Entity Create Form (No Parent ID)

For entities without a parent, omit the `parentId` argument:

```ts
const { form } = projectFormHooks.task.useCreateForm(undefined, {
  defaultValues: { title: "", status: "open", priority: 0 },
});
```

### Disabling Form Reset on Success

Keep the form values intact after a successful create:

```ts
const { form } = projectFormHooks.task.useCreateForm(projectId, {
  defaultValues: { title: "", status: "open", priority: 0 },
  resetOnSuccess: false,
});
```

## Related

- [@simplix-react/form API Reference](../api/@simplix-react/form/README.md) -- Full API documentation
- [Defining Entities in a Contract](./defining-entities.md) -- Setting up entity schemas
- [Testing with Mocks](./testing-with-mocks.md) -- Testing components that use form hooks
