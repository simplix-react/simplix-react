[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / DerivedUpdateHook

# Type Alias: DerivedUpdateHook()\<TInput, TOutput\>

> **DerivedUpdateHook**\<`TInput`, `TOutput`\> = (`options?`) => `UseMutationResult`\<`TOutput`, `Error`, \{ `dto`: `TInput`; `id`: `string`; \}\>

Defined in: [types.ts:113](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/react/src/types.ts#L113)

Represents a derived update mutation hook.

Accepts `{ id, dto }` as mutation variables. Supports optimistic updates
via the `optimistic` option. Automatically invalidates all entity queries
on settlement.

## Type Parameters

### TInput

`TInput`

The update DTO type (inferred from the entity's updateSchema)

### TOutput

`TOutput`

The entity type returned after update

## Parameters

### options?

`Omit`\<`UseMutationOptions`\<`TOutput`, `Error`, \{ `dto`: `TInput`; `id`: `string`; \}\>, `"mutationFn"`\>

## Returns

`UseMutationResult`\<`TOutput`, `Error`, \{ `dto`: `TInput`; `id`: `string`; \}\>

## Example

```ts
import { deriveHooks } from "@simplix-react/react";

const hooks = deriveHooks(projectContract);
const updateTask = hooks.task.useUpdate({ optimistic: true });
updateTask.mutate({ id: taskId, dto: { status: "done" } });
```

## See

[EntityHooks](../interfaces/EntityHooks.md) for the complete set of entity hooks.
