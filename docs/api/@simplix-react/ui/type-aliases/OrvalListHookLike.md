[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / OrvalListHookLike

# Type Alias: OrvalListHookLike()

> **OrvalListHookLike** = (`params?`, `options?`) => `object`

Defined in: [packages/headless/dist/index.d.ts:103](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L103)

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
