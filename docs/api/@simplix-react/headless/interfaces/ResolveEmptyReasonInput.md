[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / ResolveEmptyReasonInput

# Interface: ResolveEmptyReasonInput

Defined in: [resolve-empty-reason.ts:4](https://github.com/simplix-react/simplix-react/blob/main/resolve-empty-reason.ts#L4)

Query and filter state a list view derives its [EmptyReason](../type-aliases/EmptyReason.md) from.

## Properties

### error

> **error**: `unknown`

Defined in: [resolve-empty-reason.ts:10](https://github.com/simplix-react/simplix-react/blob/main/resolve-empty-reason.ts#L10)

Settled rejection, if any.

***

### failureCount?

> `optional` **failureCount**: `number`

Defined in: [resolve-empty-reason.ts:14](https://github.com/simplix-react/simplix-react/blob/main/resolve-empty-reason.ts#L14)

Consecutive failed fetch attempts — React Query `failureCount`.

***

### hasFilters?

> `optional` **hasFilters**: `boolean`

Defined in: [resolve-empty-reason.ts:18](https://github.com/simplix-react/simplix-react/blob/main/resolve-empty-reason.ts#L18)

Whether at least one filter is committed.

***

### hasRows

> **hasRows**: `boolean`

Defined in: [resolve-empty-reason.ts:6](https://github.com/simplix-react/simplix-react/blob/main/resolve-empty-reason.ts#L6)

Whether the view currently renders at least one row.

***

### hasSearch?

> `optional` **hasSearch**: `boolean`

Defined in: [resolve-empty-reason.ts:16](https://github.com/simplix-react/simplix-react/blob/main/resolve-empty-reason.ts#L16)

Whether a search term is active.

***

### isLoading

> **isLoading**: `boolean`

Defined in: [resolve-empty-reason.ts:8](https://github.com/simplix-react/simplix-react/blob/main/resolve-empty-reason.ts#L8)

Whether the query is loading (React Query `isLoading`).

***

### isPaused?

> `optional` **isPaused**: `boolean`

Defined in: [resolve-empty-reason.ts:12](https://github.com/simplix-react/simplix-react/blob/main/resolve-empty-reason.ts#L12)

Whether the query is stalled — React Query `fetchStatus === "paused"`.
