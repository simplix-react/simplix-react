[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / DerivedCreateHook

# Type Alias: DerivedCreateHook()\<TInput, TOutput\>

> **DerivedCreateHook**\<`TInput`, `TOutput`\> = (`parentId?`, `options?`) => `UseMutationResult`\<`TOutput`, `Error`, `TInput`\>

Defined in: [types.ts:84](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/react/src/types.ts#L84)

Represents a derived create mutation hook.

Automatically invalidates all entity queries on success.
For child entities, accepts a `parentId` as the first argument.

## Type Parameters

### TInput

`TInput`

The create DTO type (inferred from the entity's createSchema)

### TOutput

`TOutput`

The entity type returned after creation

## Parameters

### parentId?

`string`

### options?

`Omit`\<`UseMutationOptions`\<`TOutput`, `Error`, `TInput`\>, `"mutationFn"`\>

## Returns

`UseMutationResult`\<`TOutput`, `Error`, `TInput`\>

## Example

```ts
import { deriveHooks } from "@simplix-react/react";

const hooks = deriveHooks(projectContract);
const createTask = hooks.task.useCreate(projectId);
createTask.mutate({ title: "New task", status: "open" });
```

## See

[EntityHooks](../interfaces/EntityHooks.md) for the complete set of entity hooks.
