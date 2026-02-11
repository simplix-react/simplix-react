[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / EntityFormHooks

# Interface: EntityFormHooks\<TSchema, TCreate\>

Defined in: [types.ts:172](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L172)

Form hook set for a single entity, containing `useCreateForm` and `useUpdateForm`.

## Remarks

Produced by `deriveFormHooks()` for each entity in the contract.
Each hook wires a TanStack Form instance to the entity's React Query
mutations with automatic dirty-field extraction and server error mapping.

## Example

```ts
import { deriveFormHooks } from "@simplix-react/form";

const formHooks = deriveFormHooks(projectApi, projectHooks);
// formHooks.task: EntityFormHooks<TaskSchema, CreateTaskSchema>
// formHooks.task.useCreateForm(parentId?, options?)
// formHooks.task.useUpdateForm(entityId, options?)
```

## See

[deriveFormHooks](../functions/deriveFormHooks.md) — derives form hooks from a contract

## Type Parameters

### TSchema

`TSchema` *extends* `z.ZodTypeAny`

Entity's Zod schema type

### TCreate

`TCreate` *extends* `z.ZodTypeAny`

Creation input Zod schema type

## Properties

### useCreateForm

> **useCreateForm**: [`DerivedCreateFormHook`](../type-aliases/DerivedCreateFormHook.md)\<`TCreate`\>

Defined in: [types.ts:177](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L177)

Hook for creating a new entity with a managed form.

***

### useUpdateForm

> **useUpdateForm**: [`DerivedUpdateFormHook`](../type-aliases/DerivedUpdateFormHook.md)\<`TSchema`\>

Defined in: [types.ts:179](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L179)

Hook for updating an existing entity with a managed form.
