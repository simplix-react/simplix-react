[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / InferOpOutputData

# Type Alias: InferOpOutputData\<Op, TSchema\>

> **InferOpOutputData**\<`Op`, `TSchema`\> = `Op` *extends* `object` ? `unknown` *extends* `O` ? [`InferEntityData`](InferEntityData.md)\<`TSchema`\> : [`InferOutputData`](InferOutputData.md)\<`O`\> : [`InferEntityData`](InferEntityData.md)\<`TSchema`\>

Defined in: [packages/contract/src/types.ts:136](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L136)

Infers an operation's output data: its `output` schema when present, otherwise
the entity's own schema (matching the runtime fallback in `deriveClient`).

## Type Parameters

### Op

`Op`

### TSchema

`TSchema`
