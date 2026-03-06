[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListHookResult

# Interface: ListHookResult\<T\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L13)

Minimal return shape for list data hooks passed to [useCrudList](../functions/useCrudList.md).

## Type Parameters

### T

`T`

Row data type.

## Properties

### data

> **data**: `T`[] \| `undefined`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L15)

Array of row items, or `undefined` while loading.

***

### error

> **error**: `Error` \| `null`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L21)

Error object if the query failed, otherwise `null`.

***

### isLoading

> **isLoading**: `boolean`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L19)

Whether the query is currently loading.

***

### total?

> `optional` **total**: `number`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L17)

Total number of items (for server-side pagination).
