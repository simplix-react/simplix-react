[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / FetchFn

# Type Alias: FetchFn()

> **FetchFn** = \<`T`\>(`path`, `options?`) => `Promise`\<`T`\>

Defined in: [packages/contract/src/types.ts:406](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/contract/src/types.ts#L406)

Represents a customizable fetch function signature.

Allows replacing the default HTTP client with a custom implementation
(e.g. for authentication headers, retry logic, or testing).

## Type Parameters

### T

`T`

The expected response type after deserialization.

## Parameters

### path

`string`

### options?

`RequestInit`

## Returns

`Promise`\<`T`\>

## See

 - [defaultFetch](../functions/defaultFetch.md) for the built-in implementation.
 - [defineApi](../functions/defineApi.md) where this is provided via `options.fetchFn`.
