[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / DerivedGetHook

# Type Alias: DerivedGetHook()\<TData\>

> **DerivedGetHook**\<`TData`\> = (`id`, `options?`) => `UseQueryResult`\<`TData`\>

Defined in: [types.ts:59](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/react/src/types.ts#L59)

Represents a derived detail query hook that fetches a single entity by ID.

Automatically disables the query when `id` is falsy.

## Type Parameters

### TData

`TData`

The entity type returned by the query

## Parameters

### id

`string`

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

[EntityHooks](../interfaces/EntityHooks.md) for the complete set of entity hooks.
