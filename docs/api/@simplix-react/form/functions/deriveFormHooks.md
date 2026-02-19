[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / deriveFormHooks

# Function: deriveFormHooks()

> **deriveFormHooks**\<`TEntities`\>(`contract`, `hooks`): [`DerivedFormHooksResult`](../type-aliases/DerivedFormHooksResult.md)\<`TEntities`\>

Defined in: [derive-form-hooks.ts:34](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/form/src/derive-form-hooks.ts#L34)

Derives TanStack Form hooks from an API contract and its derived React Query hooks.

For each entity in the contract, produces `useCreateForm` and/or `useUpdateForm` hooks
based on the presence of `create` and `update` role operations. These hooks wire
TanStack Form to the entity's mutations with automatic dirty-field extraction
and server error mapping.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, `AnyEntityDef`\>

## Parameters

### contract

The API contract produced by `defineApi()` from `@simplix-react/contract`

#### config

[`ApiContractConfig`](../@simplix-react/contract/interfaces/ApiContractConfig.md)\<`TEntities`, `any`\>

### hooks

\{ \[K in string \| number \| symbol\]: EntityHooks\<TEntities\[K\]\["schema"\]\> \}

The React Query hooks produced by `deriveHooks()` from `@simplix-react/react`

## Returns

[`DerivedFormHooksResult`](../type-aliases/DerivedFormHooksResult.md)\<`TEntities`\>

An object keyed by entity name, each containing form hooks

## Example

```ts
import { deriveFormHooks } from "@simplix-react/form";
import { inventoryApi } from "./contract";
import { inventoryHooks } from "./hooks";

export const inventoryFormHooks = deriveFormHooks(inventoryApi, inventoryHooks);

// Use in components
function CreateProductForm() {
  const { form, isSubmitting } = inventoryFormHooks.product.useCreateForm();
  return <form onSubmit={e => { e.preventDefault(); form.handleSubmit(); }}>...</form>;
}
```
