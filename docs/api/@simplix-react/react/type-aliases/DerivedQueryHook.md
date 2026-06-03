[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / DerivedQueryHook

# Type Alias: DerivedQueryHook()\<TData\>

> **DerivedQueryHook**\<`TData`\> = (`params?`, `options?`) => `UseQueryResult`\<`TData`\>

Defined in: [types.ts:198](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L198)

Represents a derived query hook produced for a custom GET operation.

## Type Parameters

### TData

`TData`

The operation's response type

## Parameters

### params?

`Record`\<`string`, `unknown`\>

### options?

`Omit`\<`UseQueryOptions`\<`TData`, `Error`\>, `"queryKey"` \| `"queryFn"`\>

## Returns

`UseQueryResult`\<`TData`\>
