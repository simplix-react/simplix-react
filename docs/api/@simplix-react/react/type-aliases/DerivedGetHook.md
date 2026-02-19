[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / DerivedGetHook

# Type Alias: DerivedGetHook()\<TData\>

> **DerivedGetHook**\<`TData`\> = (`id`, `options?`) => `UseQueryResult`\<`TData`\>

Defined in: [types.ts:59](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L59)

Represents a derived detail query hook that fetches a single entity by ID.

Automatically disables the query when `id` is falsy.

## Type Parameters

### TData

`TData`

The entity type returned by the query

## Parameters

### id

`EntityId`

### options?

`Omit`\<`UseQueryOptions`\<`TData`, `Error`\>, `"queryKey"` \| `"queryFn"`\>

## Returns

`UseQueryResult`\<`TData`\>

## Example

```ts
import { deriveHooks } from "@simplix-react/react";

const hooks = deriveHooks(projectContract);
const { data: task } = hooks.task.useGet(taskId);
```

## See

[EntityHooks](EntityHooks.md) for the complete set of entity hooks.
