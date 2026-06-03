[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / DerivedTreeHook

# Type Alias: DerivedTreeHook()\<TData\>

> **DerivedTreeHook**\<`TData`\> = (`params?`, `options?`) => `UseQueryResult`\<`TData`\>

Defined in: [types.ts:188](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L188)

Represents a derived tree query hook produced for a `tree`-role operation.

## Type Parameters

### TData

`TData`

The tree response type

## Parameters

### params?

`Record`\<`string`, `unknown`\>

### options?

`Omit`\<`UseQueryOptions`\<`TData`, `Error`\>, `"queryKey"` \| `"queryFn"`\>

## Returns

`UseQueryResult`\<`TData`\>
