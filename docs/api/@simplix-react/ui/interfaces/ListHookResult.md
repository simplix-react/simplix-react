[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListHookResult

# Interface: ListHookResult\<T\>

Defined in: [packages/headless/dist/index.d.ts:39](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L39)

Minimal return shape for list data hooks passed to a list state machine
(the web `useCrudList` page model or the native `useEntityFeed` feed model).

## Type Parameters

### T

`T`

Row data type.

## Properties

### data

> **data**: `T`[] \| `undefined`

Defined in: [packages/headless/dist/index.d.ts:41](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L41)

Array of row items, or `undefined` while loading.

***

### error

> **error**: `Error` \| `null`

Defined in: [packages/headless/dist/index.d.ts:47](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L47)

Error object if the query failed, otherwise `null`.

***

### failureCount?

> `optional` **failureCount**: `number`

Defined in: [packages/headless/dist/index.d.ts:65](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L65)

Number of consecutive failed fetch attempts — React Query's
`failureCount`. A value greater than `0` while `error` is still `null`
means an attempt failed and a retry is pending, which is a non-success
state rather than an empty result.

***

### isLoading

> **isLoading**: `boolean`

Defined in: [packages/headless/dist/index.d.ts:45](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L45)

Whether the query is currently loading.

***

### isPaused?

> `optional` **isPaused**: `boolean`

Defined in: [packages/headless/dist/index.d.ts:58](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L58)

Whether the query is in flight but stalled — React Query's
`fetchStatus === "paused"`. A paused query reports `isLoading: false` and
`error: null`, so without this flag a stalled fetch is indistinguishable
from a successful empty result.

#### Remarks

Optional so that existing producers of this shape keep compiling; omit it
and the list falls back to the settled-only interpretation.

***

### total?

> `optional` **total**: `number`

Defined in: [packages/headless/dist/index.d.ts:43](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L43)

Total number of items (for server-side pagination).
