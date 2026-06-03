[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / InferEntityData

# Type Alias: InferEntityData\<TSchema\>

> **InferEntityData**\<`TSchema`\> = `TSchema` *extends* `z.ZodType` ? `z.infer`\<`TSchema`\> : `unknown`

Defined in: [packages/contract/src/types.ts:123](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L123)

Infers the entity data type from its Zod schema (`unknown` when not a schema).

## Type Parameters

### TSchema

`TSchema`
