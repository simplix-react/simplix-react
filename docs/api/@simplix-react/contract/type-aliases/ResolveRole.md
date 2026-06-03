[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / ResolveRole

# Type Alias: ResolveRole\<K, Op\>

> **ResolveRole**\<`K`, `Op`\> = `Op` *extends* `object` ? `R` : `K` *extends* `CrudOperationName` ? `K` : `"custom"`

Defined in: [packages/contract/src/types.ts:114](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L114)

Resolves the effective CRUD role of an operation at the type level, mirroring
the runtime `resolveRole`: an explicit `role` wins, otherwise the operation
key is matched against the standard CRUD names, otherwise `"custom"`.

## Type Parameters

### K

`K` *extends* `string`

The operation key name.

### Op

`Op`

The operation definition.
