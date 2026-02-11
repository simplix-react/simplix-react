[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / DerivedInfiniteListHook

# Type Alias: DerivedInfiniteListHook()\<TData\>

> **DerivedInfiniteListHook**\<`TData`\> = (`parentId?`, `params?`, `options?`) => `UseInfiniteQueryResult`\<\{ `data`: `TData`[]; `meta`: `PageInfo`; \}, `Error`\>

Defined in: [types.ts:166](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/react/src/types.ts#L166)

Represents a derived infinite list query hook for cursor-based or offset-based pagination.

Automatically determines the next page parameter from the response `meta` field.
Pagination parameters are managed internally; callers provide only filters, sort,
and an optional page size limit.

## Type Parameters

### TData

`TData`

The entity type returned in each page

## Parameters

### parentId?

`string`

### params?

`Omit`\<`ListParams`, `"pagination"`\> & `object`

### options?

`Record`\<`string`, `unknown`\>

## Returns

`UseInfiniteQueryResult`\<\{ `data`: `TData`[]; `meta`: `PageInfo`; \}, `Error`\>

## Example

```ts
import { deriveHooks } from "@simplix-react/react";

const hooks = deriveHooks(projectContract);
const { data, fetchNextPage, hasNextPage } = hooks.task.useInfiniteList(
  projectId,
  { limit: 10, filters: { status: "open" } },
);
```

## See

[EntityHooks](../interfaces/EntityHooks.md) for the complete set of entity hooks.
