[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / EntityFormHooks

# Interface: EntityFormHooks\<TSchema\>

Defined in: [types.ts:146](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L146)

Form hook set for a single entity, containing `useCreateForm` and `useUpdateForm`.

Only populated for operations with `create` and `update` roles respectively.
If an entity lacks a create or update operation, the corresponding hook will be absent.

## Example

```ts
import { deriveFormHooks } from "@simplix-react/form";

const formHooks = deriveFormHooks(inventoryApi, inventoryHooks);
// formHooks.product.useCreateForm(parentId?, options?)
// formHooks.product.useUpdateForm(entityId, options?)
```

## See

[deriveFormHooks](../functions/deriveFormHooks.md) — derives form hooks from a contract

## Type Parameters

### TSchema

`TSchema` *extends* `z.ZodTypeAny` = `z.ZodTypeAny`

Entity's Zod schema type

## Properties

### useCreateForm?

> `optional` **useCreateForm**: [`DerivedCreateFormHook`](../type-aliases/DerivedCreateFormHook.md)\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>

Defined in: [types.ts:150](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L150)

Hook for creating a new entity with a managed form. Present only if a `create` operation exists.

***

### useUpdateForm?

> `optional` **useUpdateForm**: [`DerivedUpdateFormHook`](../type-aliases/DerivedUpdateFormHook.md)\<`TSchema`\>

Defined in: [types.ts:152](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L152)

Hook for updating an existing entity with a managed form. Present only if an `update` operation exists.
