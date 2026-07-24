[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / ListHookResult

# Interface: ListHookResult\<T\>

Defined in: [list-types.ts:8](https://github.com/simplix-react/simplix-react/blob/main/list-types.ts#L8)

Minimal return shape for list data hooks passed to a list state machine
(the web `useCrudList` page model or the native `useEntityFeed` feed model).

## Type Parameters

### T

`T`

Row data type.

## Properties

### data

> **data**: `T`[] \| `undefined`

Defined in: [list-types.ts:10](https://github.com/simplix-react/simplix-react/blob/main/list-types.ts#L10)

Array of row items, or `undefined` while loading.

***

### error

> **error**: `Error` \| `null`

Defined in: [list-types.ts:16](https://github.com/simplix-react/simplix-react/blob/main/list-types.ts#L16)

Error object if the query failed, otherwise `null`.

***

### isLoading

> **isLoading**: `boolean`

Defined in: [list-types.ts:14](https://github.com/simplix-react/simplix-react/blob/main/list-types.ts#L14)

Whether the query is currently loading.

***

### total?

> `optional` **total**: `number`

Defined in: [list-types.ts:12](https://github.com/simplix-react/simplix-react/blob/main/list-types.ts#L12)

Total number of items (for server-side pagination).
