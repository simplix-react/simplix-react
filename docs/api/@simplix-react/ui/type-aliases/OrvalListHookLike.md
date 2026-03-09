[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / OrvalListHookLike

# Type Alias: OrvalListHookLike()

> **OrvalListHookLike** = (`params?`, `options?`) => `object`

Defined in: [packages/ui/src/crud/list/adapt-orval-list.ts:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/adapt-orval-list.ts#L10)

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

`object`

### data

> **data**: `unknown`

### error

> **error**: `unknown`

### isLoading

> **isLoading**: `boolean`
