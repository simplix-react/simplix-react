<p align="center">
  <img src="../../docs/assets/simplix-logo.png" alt="simplix-react" width="200" />
</p>

# @simplix-react/form

TanStack Form hooks derived automatically from `@simplix-react/contract` schemas and `@simplix-react/react` hooks.

> **Prerequisites:** Requires a contract defined with `@simplix-react/contract` and hooks derived with `@simplix-react/react`.

## Installation

```bash
pnpm add @simplix-react/form @tanstack/react-form
```

**Peer dependencies:**

| Package | Version |
| --- | --- |
| `@simplix-react/contract` | workspace |
| `@simplix-react/react` | workspace |
| `@tanstack/react-form` | >= 1.0.0 |
| `@tanstack/react-query` | >= 5.0.0 |
| `react` | >= 18.0.0 |
| `zod` | >= 4.0.0 |

## Quick Example

```ts
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";
import { deriveHooks } from "@simplix-react/react";
import { deriveFormHooks } from "@simplix-react/form";
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
  queryBuilder: simpleQueryBuilder,
});

// 2. Derive React Query hooks
const hooks = deriveHooks(projectContract);

// 3. Derive form hooks — one call generates everything
const formHooks = deriveFormHooks(projectContract, hooks);

// 4. Use in components
function CreateTaskForm({ projectId }: { projectId: string }) {
  const { form, isSubmitting, submitError, reset } = formHooks.task.useCreateForm(projectId);

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.Field name="title">
        {(field) => <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}
      </form.Field>
      <button type="submit" disabled={isSubmitting}>Create</button>
      {submitError && <p>{submitError.message}</p>}
    </form>
  );
}
```

## API Overview

| Export | Kind | Description |
| --- | --- | --- |
| `deriveFormHooks` | Function | Derives entity form hooks from contract + hooks |
| `extractDirtyFields` | Function | Extracts only changed fields (for PATCH requests) |
| `mapServerErrorsToForm` | Function | Maps 422 server errors to form field errors |
| `CreateFormOptions` | Type | Options interface for `useCreateForm` |
| `UpdateFormOptions` | Type | Options interface for `useUpdateForm` |
| `CreateFormReturn` | Type | Return type interface for `useCreateForm` |
| `UpdateFormReturn` | Type | Return type interface for `useUpdateForm` |
| `DerivedCreateFormHook` | Type | Create form hook signature |
| `DerivedUpdateFormHook` | Type | Update form hook signature |
| `EntityFormHooks` | Type | Form hook interface for a single entity |

## Key Concepts

### Hook Derivation

`deriveFormHooks()` reads the entity definitions from the API contract and generates `useCreateForm` and `useUpdateForm` hooks for each entity. Internally, it connects the mutation hooks from `@simplix-react/react` to TanStack Form.

```ts
const formHooks = deriveFormHooks(projectContract, projectHooks);
// formHooks.task.useCreateForm  → create mutation + TanStack Form
// formHooks.task.useUpdateForm  → update mutation + TanStack Form + dirty tracking
```

### Auto Dirty-Field Extraction

`useUpdateForm` sends only changed fields to the server by default (`dirtyOnly: true`). It compares the original entity data with the current form values and extracts only the differences, automatically producing PATCH-friendly requests.

### Server Error Mapping

When the server returns a 422 Validation Error, `mapServerErrorsToForm` automatically sets per-field error messages on the form. Both Rails format and JSON:API format are supported.

## Hook Reference

### `useCreateForm`

A form hook for creating new entities. Connects a TanStack Form instance with the create mutation.

```ts
const { form, isSubmitting, submitError, reset } = formHooks.task.useCreateForm(parentId?, options?);
```

**Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `parentId` | `string?` | Parent entity ID (for child entities) |
| `options.defaultValues` | `Partial<CreateSchema>?` | Initial form values |
| `options.resetOnSuccess` | `boolean?` | Reset form on success (default: `true`) |
| `options.onSuccess` | `(data) => void` | Success callback |
| `options.onError` | `(error) => void` | Error callback |

**Returns:**

| Property | Type | Description |
| --- | --- | --- |
| `form` | `AnyFormApi` | TanStack Form instance |
| `isSubmitting` | `boolean` | Whether submission is in progress |
| `submitError` | `Error \| null` | Last submission error |
| `reset` | `() => void` | Reset form and error state |

### `useUpdateForm`

A form hook for updating existing entities. Automatically loads entity data and resets the form on refetch.

```ts
const { form, isLoading, isSubmitting, submitError, entity } = formHooks.task.useUpdateForm(entityId, options?);
```

**Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `entityId` | `string` | ID of the entity to update (required) |
| `options.dirtyOnly` | `boolean?` | Send only changed fields (default: `true`) |
| `options.onSuccess` | `(data) => void` | Success callback |
| `options.onError` | `(error) => void` | Error callback |

**Returns:**

| Property | Type | Description |
| --- | --- | --- |
| `form` | `AnyFormApi` | TanStack Form instance |
| `isLoading` | `boolean` | Whether entity data is loading |
| `isSubmitting` | `boolean` | Whether submission is in progress |
| `submitError` | `Error \| null` | Last submission error |
| `entity` | `Entity \| undefined` | Loaded entity data |

## Utilities

### `extractDirtyFields(current, original)`

Compares two objects using deep equality and extracts only the changed fields. Supports Date, arrays, and nested objects.

```ts
import { extractDirtyFields } from "@simplix-react/form";

const dirty = extractDirtyFields(
  { name: "Updated", status: "active", priority: 1 },
  { name: "Original", status: "active", priority: 1 },
);
// → { name: "Updated" }
```

### `mapServerErrorsToForm(error, form)`

Parses the response body of a 422 `ApiError` and maps it to TanStack Form field errors.

Supported error formats:

- **Rails:** `{ errors: { [field]: string[] } }`
- **JSON:API:** `{ errors: [{ field, message }] }`

```ts
import { mapServerErrorsToForm } from "@simplix-react/form";

// Manual usage (automatically called inside hooks)
try {
  await mutation.mutateAsync(data);
} catch (error) {
  mapServerErrorsToForm(error, form);
}
```

## CLI Integration

When generating code from OpenAPI specs with `@simplix-react/cli`, form hook files are automatically generated.

```bash
simplix openapi <spec-path>              # Generates including form-hooks.ts
simplix openapi <spec-path> --no-forms   # Skips form hook generation
```

## Related Packages

| Package | Description |
| --- | --- |
| `@simplix-react/contract` | Zod-based type-safe API contract definitions |
| `@simplix-react/react` | React Query hooks derived from contracts |
| `@simplix-react/mock` | Auto-generated MSW handlers with in-memory stores |

---

Next Step → `@simplix-react/mock`
