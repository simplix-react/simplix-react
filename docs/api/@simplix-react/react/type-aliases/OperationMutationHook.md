[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / OperationMutationHook

# Type Alias: OperationMutationHook()\<TInput, TOutput\>

> **OperationMutationHook**\<`TInput`, `TOutput`\> = (`options?`) => `UseMutationResult`\<`TOutput`, `Error`, `TInput`\>

Defined in: [types.ts:208](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/react/src/types.ts#L208)

Represents a derived mutation hook for a custom operation.

Wraps the operation client function with TanStack Query's `useMutation`.
All mutation options except `mutationFn` can be passed through.

## Type Parameters

### TInput

`TInput`

The input type for the operation

### TOutput

`TOutput`

The output type for the operation

## Parameters

### options?

`Omit`\<`UseMutationOptions`\<`TOutput`, `Error`, `TInput`\>, `"mutationFn"`\>

## Returns

`UseMutationResult`\<`TOutput`, `Error`, `TInput`\>

## See

[OperationHooks](../interfaces/OperationHooks.md) for the operation hooks container.
