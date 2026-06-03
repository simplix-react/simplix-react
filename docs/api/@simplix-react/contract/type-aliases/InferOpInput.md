[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / InferOpInput

# Type Alias: InferOpInput\<Op\>

> **InferOpInput**\<`Op`\> = `Op` *extends* `object` ? `z.infer`\<`I`\> : `unknown`

Defined in: [packages/contract/src/types.ts:128](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L128)

Infers an operation's input DTO type from its `input` schema (`unknown` when absent).

## Type Parameters

### Op

`Op`
