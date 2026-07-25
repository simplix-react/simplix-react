[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseCrudListResult

# Interface: UseCrudListResult\<T\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:75](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L75)

Complete state returned by [useCrudList](../functions/useCrudList.md).

## Type Parameters

### T

`T`

## Properties

### data

> **data**: `T`[]

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:76](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L76)

***

### emptyReason

> **emptyReason**: [`EmptyReason`](../type-aliases/EmptyReason.md) \| `null`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:94](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L94)

***

### error

> **error**: `Error` \| `null`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:78](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L78)

***

### failureCount

> **failureCount**: `number`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:89](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L89)

Consecutive failed fetch attempts on the underlying query. Greater than `0`
with `error === null` means a retry is pending.

***

### filters

> **filters**: [`CrudListFilters`](CrudListFilters.md)

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:90](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L90)

***

### isLoading

> **isLoading**: `boolean`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:77](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L77)

***

### isPaused

> **isPaused**: `boolean`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:84](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L84)

Whether the underlying query is in flight but stalled (React Query
`fetchStatus === "paused"`). Such a query reports `isLoading: false` and
`error: null`; consult this before treating an empty `data` as "no data".

***

### pagination

> **pagination**: [`CrudListPagination`](CrudListPagination.md)

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:92](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L92)

***

### selection

> **selection**: [`CrudListSelection`](CrudListSelection.md)\<`T`\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:93](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L93)

***

### sort

> **sort**: [`CrudListSort`](CrudListSort.md)

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:91](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L91)
