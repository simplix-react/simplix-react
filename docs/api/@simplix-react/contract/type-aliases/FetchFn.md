[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / FetchFn

# Type Alias: FetchFn()

> **FetchFn** = \<`T`\>(`path`, `options?`) => `Promise`\<`T`\>

Defined in: [packages/contract/src/types.ts:306](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/contract/src/types.ts#L306)

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
