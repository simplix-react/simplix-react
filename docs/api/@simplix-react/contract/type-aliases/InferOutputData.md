[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / InferOutputData

# Type Alias: InferOutputData\<T\>

> **InferOutputData**\<`T`\> = `T` *extends* [`WiredSchema`](../interfaces/WiredSchema.md)\<infer \_W, infer TData\> ? `z.infer`\<`TData`\> : `T` *extends* `z.ZodType` ? `z.infer`\<`T`\> : `unknown`

Defined in: [packages/contract/src/types.ts:94](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L94)

Extracts the business data type from an operation output.

- [WiredSchema](../interfaces/WiredSchema.md) → `z.infer<TData>` (the unwrapped business payload)
- `z.ZodType` → `z.infer<T>` (direct schema inference)
- `unknown` / `undefined` → `unknown`

## Type Parameters

### T

`T`
