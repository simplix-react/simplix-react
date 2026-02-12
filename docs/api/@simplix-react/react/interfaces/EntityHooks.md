[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / EntityHooks

# Interface: EntityHooks\<TSchema, TCreate, TUpdate\>

Defined in: [types.ts:202](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/react/src/types.ts#L202)

Represents the complete set of React Query hooks derived from an entity definition.

Each entity in the contract produces an object conforming to this interface,
with hooks for CRUD operations and infinite scrolling.

## Example

```ts
import { deriveHooks } from "@simplix-react/react";

const hooks = deriveHooks(projectContract);

// hooks.task satisfies EntityHooks<TaskSchema, CreateTaskSchema, UpdateTaskSchema>
const { data } = hooks.task.useList();
const { data: single } = hooks.task.useGet(id);
const create = hooks.task.useCreate();
const update = hooks.task.useUpdate();
const remove = hooks.task.useDelete();
const infinite = hooks.task.useInfiniteList();
```

## See

[deriveHooks](../functions/deriveHooks.md) for generating these hooks from a contract.

## Type Parameters

### TSchema

`TSchema` *extends* `z.ZodTypeAny`

The Zod schema defining the entity shape

### TCreate

`TCreate` *extends* `z.ZodTypeAny`

The Zod schema defining the create DTO shape

### TUpdate

`TUpdate` *extends* `z.ZodTypeAny`

The Zod schema defining the update DTO shape

## Properties

### useCreate

> **useCreate**: [`DerivedCreateHook`](../type-aliases/DerivedCreateHook.md)\<`output`\<`TCreate`\>, `output`\<`TSchema`\>\>

Defined in: [types.ts:209](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/react/src/types.ts#L209)

***

### useDelete

> **useDelete**: [`DerivedDeleteHook`](../type-aliases/DerivedDeleteHook.md)

Defined in: [types.ts:211](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/react/src/types.ts#L211)

***

### useGet

> **useGet**: [`DerivedGetHook`](../type-aliases/DerivedGetHook.md)\<`output`\<`TSchema`\>\>

Defined in: [types.ts:208](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/react/src/types.ts#L208)

***

### useInfiniteList

> **useInfiniteList**: [`DerivedInfiniteListHook`](../type-aliases/DerivedInfiniteListHook.md)\<`output`\<`TSchema`\>\>

Defined in: [types.ts:212](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/react/src/types.ts#L212)

***

### useList

> **useList**: [`DerivedListHook`](../type-aliases/DerivedListHook.md)\<`output`\<`TSchema`\>\>

Defined in: [types.ts:207](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/react/src/types.ts#L207)

***

### useUpdate

> **useUpdate**: [`DerivedUpdateHook`](../type-aliases/DerivedUpdateHook.md)\<`output`\<`TUpdate`\>, `output`\<`TSchema`\>\>

Defined in: [types.ts:210](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/react/src/types.ts#L210)
