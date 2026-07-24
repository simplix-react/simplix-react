[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListHookResult

# Interface: ListHookResult\<T\>

Defined in: [packages/headless/dist/index.d.ts:26](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L26)

Minimal return shape for list data hooks passed to a list state machine
(the web `useCrudList` page model or the native `useEntityFeed` feed model).

## Type Parameters

### T

`T`

Row data type.

## Properties

### data

> **data**: `T`[] \| `undefined`

Defined in: [packages/headless/dist/index.d.ts:28](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L28)

Array of row items, or `undefined` while loading.

***

### error

> **error**: `Error` \| `null`

Defined in: [packages/headless/dist/index.d.ts:34](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L34)

Error object if the query failed, otherwise `null`.

***

### isLoading

> **isLoading**: `boolean`

Defined in: [packages/headless/dist/index.d.ts:32](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L32)

Whether the query is currently loading.

***

### total?

> `optional` **total**: `number`

Defined in: [packages/headless/dist/index.d.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L30)

Total number of items (for server-side pagination).
