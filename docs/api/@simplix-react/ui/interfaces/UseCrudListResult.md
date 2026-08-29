[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseCrudListResult

# Interface: UseCrudListResult\<T\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:98](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L98)

Complete state returned by [useCrudList](../functions/useCrudList.md).

## Type Parameters

### T

`T`

## Properties

### data

> **data**: `T`[]

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:99](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L99)

***

### emptyReason

> **emptyReason**: [`EmptyReason`](../type-aliases/EmptyReason.md) \| `null`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:117](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L117)

***

### error

> **error**: `Error` \| `null`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:101](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L101)

***

### failureCount

> **failureCount**: `number`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:112](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L112)

Consecutive failed fetch attempts on the underlying query. Greater than `0`
with `error === null` means a retry is pending.

***

### filters

> **filters**: [`CrudListFilters`](CrudListFilters.md)

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:113](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L113)

***

### isLoading

> **isLoading**: `boolean`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:100](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L100)

***

### isPaused

> **isPaused**: `boolean`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:107](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L107)

Whether the underlying query is in flight but stalled (React Query
`fetchStatus === "paused"`). Such a query reports `isLoading: false` and
`error: null`; consult this before treating an empty `data` as "no data".

***

### pagination

> **pagination**: [`CrudListPagination`](CrudListPagination.md)

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:115](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L115)

***

### selection

> **selection**: [`CrudListSelection`](CrudListSelection.md)\<`T`\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:116](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L116)

***

### sort

> **sort**: [`CrudListSort`](CrudListSort.md)

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:114](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L114)
