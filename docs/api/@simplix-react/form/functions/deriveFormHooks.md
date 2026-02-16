[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / deriveFormHooks

# Function: deriveFormHooks()

> **deriveFormHooks**\<`TEntities`\>(`contract`, `hooks`): [`DerivedFormHooksResult`](../type-aliases/DerivedFormHooksResult.md)\<`TEntities`\>

Defined in: [derive-form-hooks.ts:33](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/form/src/derive-form-hooks.ts#L33)

Derives TanStack Form hooks from an API contract and its derived React Query hooks.

For each entity in the contract, produces `useCreateForm` and `useUpdateForm` hooks
that wire TanStack Form to the entity's create/update mutations with automatic
dirty-field extraction and server error mapping.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, `AnyEntityDef`\>

## Parameters

### contract

The API contract produced by `defineApi()` from `@simplix-react/contract`

#### config

[`ApiContractConfig`](../@simplix-react/contract/interfaces/ApiContractConfig.md)\<`TEntities`, `any`\>

### hooks

\{ \[K in string \| number \| symbol\]: EntityHooks\<TEntities\[K\]\["schema"\], TEntities\[K\]\["createSchema"\], TEntities\[K\]\["updateSchema"\]\> \}

The React Query hooks produced by `deriveHooks()` from `@simplix-react/react`

## Returns

[`DerivedFormHooksResult`](../type-aliases/DerivedFormHooksResult.md)\<`TEntities`\>

An object keyed by entity name, each containing form hooks

## Example

```ts
import { deriveFormHooks } from "@simplix-react/form";
import { projectApi } from "./contract";
import { projectHooks } from "./hooks";

export const projectFormHooks = deriveFormHooks(projectApi, projectHooks);

// Use in components
function CreateTaskForm() {
  const { form, isSubmitting } = projectFormHooks.task.useCreateForm(projectId);
  return <form onSubmit={e => { e.preventDefault(); form.handleSubmit(); }}>...</form>;
}
```
