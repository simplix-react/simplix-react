[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / OrvalListHookLike

# Type Alias: OrvalListHookLike()

> **OrvalListHookLike** = (`params?`, `options?`) => `object`

Defined in: [adapt-orval-list.ts:11](https://github.com/simplix-react/simplix-react/blob/main/adapt-orval-list.ts#L11)

Loose hook shape that accepts any Orval-generated list hook.
Orval hooks have concretely typed params / return that are incompatible
with generic signatures due to contravariance.
We use `any` at this adapter boundary intentionally.

## Parameters

### params?

`any`

### options?

`any`

## Returns

### data

> **data**: `unknown`

### error

> **error**: `unknown`

### failureCount?

> `optional` **failureCount**: `number`

React Query consecutive failed attempts. Absent on non-React-Query hooks.

### isLoading

> **isLoading**: `boolean`

### isPaused?

> `optional` **isPaused**: `boolean`

React Query `fetchStatus === "paused"`. Absent on non-React-Query hooks.
