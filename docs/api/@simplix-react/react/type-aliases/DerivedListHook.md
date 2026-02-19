[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / DerivedListHook

# Type Alias: DerivedListHook()\<TData\>

> **DerivedListHook**\<`TData`\> = (`parentIdOrParams?`, `paramsOrOptions?`, `options?`) => `UseQueryResult`\<`TData`[]\>

Defined in: [types.ts:36](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/react/src/types.ts#L36)

Represents a derived list query hook with overloaded call signatures.

Supports three calling conventions:
- `useList(options?)` — top-level entity list
- `useList(params, options?)` — filtered/sorted list
- `useList(parentId, params?, options?)` — child entity list

All TanStack Query options except `queryKey` and `queryFn` can be passed through.

## Type Parameters

### TData

`TData`

The entity type returned by the query

## Parameters

### parentIdOrParams?

`string` | `ListParams`

### paramsOrOptions?

`ListParams` | `Omit`\<`UseQueryOptions`\<`TData`[], `Error`\>, `"queryKey"` \| `"queryFn"`\>

### options?

`Omit`\<`UseQueryOptions`\<`TData`[], `Error`\>, `"queryKey"` \| `"queryFn"`\>

## Returns

`UseQueryResult`\<`TData`[]\>

## Example

```ts
import { deriveHooks } from "@simplix-react/react";

const hooks = deriveHooks(projectContract);
const { data: tasks } = hooks.task.useList(projectId, {
  filters: { status: "open" },
  sort: { field: "createdAt", direction: "desc" },
});
```

## See

[EntityHooks](EntityHooks.md) for the complete set of entity hooks.
