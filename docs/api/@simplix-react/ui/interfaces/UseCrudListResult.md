[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseCrudListResult

# Interface: UseCrudListResult\<T\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:83](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L83)

Complete state returned by [useCrudList](../functions/useCrudList.md).

## Type Parameters

### T

`T`

## Properties

### data

> **data**: `T`[]

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:84](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L84)

***

### emptyReason

> **emptyReason**: [`EmptyReason`](../type-aliases/EmptyReason.md) \| `null`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:102](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L102)

***

### error

> **error**: `Error` \| `null`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:86](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L86)

***

### failureCount

> **failureCount**: `number`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:97](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L97)

Consecutive failed fetch attempts on the underlying query. Greater than `0`
with `error === null` means a retry is pending.

***

### filters

> **filters**: [`CrudListFilters`](CrudListFilters.md)

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:98](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L98)

***

### isLoading

> **isLoading**: `boolean`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:85](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L85)

***

### isPaused

> **isPaused**: `boolean`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:92](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L92)

Whether the underlying query is in flight but stalled (React Query
`fetchStatus === "paused"`). Such a query reports `isLoading: false` and
`error: null`; consult this before treating an empty `data` as "no data".

***

### pagination

> **pagination**: [`CrudListPagination`](CrudListPagination.md)

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:100](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L100)

***

### selection

> **selection**: [`CrudListSelection`](CrudListSelection.md)\<`T`\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:101](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L101)

***

### sort

> **sort**: [`CrudListSort`](CrudListSort.md)

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:99](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L99)
