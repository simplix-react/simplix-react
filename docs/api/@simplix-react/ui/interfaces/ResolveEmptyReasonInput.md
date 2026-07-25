[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ResolveEmptyReasonInput

# Interface: ResolveEmptyReasonInput

Defined in: [packages/headless/dist/index.d.ts:77](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L77)

Query and filter state a list view derives its [EmptyReason](../type-aliases/EmptyReason.md) from.

## Properties

### error

> **error**: `unknown`

Defined in: [packages/headless/dist/index.d.ts:83](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L83)

Settled rejection, if any.

***

### failureCount?

> `optional` **failureCount**: `number`

Defined in: [packages/headless/dist/index.d.ts:87](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L87)

Consecutive failed fetch attempts — React Query `failureCount`.

***

### hasFilters?

> `optional` **hasFilters**: `boolean`

Defined in: [packages/headless/dist/index.d.ts:91](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L91)

Whether at least one filter is committed.

***

### hasRows

> **hasRows**: `boolean`

Defined in: [packages/headless/dist/index.d.ts:79](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L79)

Whether the view currently renders at least one row.

***

### hasSearch?

> `optional` **hasSearch**: `boolean`

Defined in: [packages/headless/dist/index.d.ts:89](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L89)

Whether a search term is active.

***

### isLoading

> **isLoading**: `boolean`

Defined in: [packages/headless/dist/index.d.ts:81](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L81)

Whether the query is loading (React Query `isLoading`).

***

### isPaused?

> `optional` **isPaused**: `boolean`

Defined in: [packages/headless/dist/index.d.ts:85](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L85)

Whether the query is stalled — React Query `fetchStatus === "paused"`.
