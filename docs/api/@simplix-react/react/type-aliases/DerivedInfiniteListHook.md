[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / DerivedInfiniteListHook

# Type Alias: DerivedInfiniteListHook()\<TData\>

> **DerivedInfiniteListHook**\<`TData`\> = (`parentId?`, `params?`, `options?`) => `UseInfiniteQueryResult`\<\{ `data`: `TData`[]; `meta`: `PageInfo`; \}, `Error`\>

Defined in: [types.ts:166](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/react/src/types.ts#L166)

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
