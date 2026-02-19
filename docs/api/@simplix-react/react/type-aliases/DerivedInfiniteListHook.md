[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / DerivedInfiniteListHook

# Type Alias: DerivedInfiniteListHook()\<TData\>

> **DerivedInfiniteListHook**\<`TData`\> = (`parentId?`, `params?`, `options?`) => `UseInfiniteQueryResult`\<\{ `data`: `TData`[]; `meta`: `PageInfo`; \}, `Error`\>

Defined in: [types.ts:153](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L153)

Represents a derived infinite list query hook for cursor-based or offset-based pagination.

Automatically determines the next page parameter from the response `meta` field.

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

## See

[EntityHooks](EntityHooks.md) for the complete set of entity hooks.
