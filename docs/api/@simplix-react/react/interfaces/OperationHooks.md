[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / OperationHooks

# Interface: OperationHooks\<TInput, TOutput\>

Defined in: [types.ts:225](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/react/src/types.ts#L225)

Represents the hook container for a custom operation defined in the contract.

Each top-level operation in the contract produces an object with a single `useMutation` hook.

## See

[deriveHooks](../functions/deriveHooks.md) for generating hooks from a contract.

## Type Parameters

### TInput

`TInput` *extends* `z.ZodTypeAny`

The Zod schema defining the operation input

### TOutput

`TOutput` *extends* `z.ZodTypeAny`

The Zod schema defining the operation output

## Properties

### useMutation

> **useMutation**: [`OperationMutationHook`](../type-aliases/OperationMutationHook.md)\<`output`\<`TInput`\>, `output`\<`TOutput`\>\>

Defined in: [types.ts:229](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/react/src/types.ts#L229)
