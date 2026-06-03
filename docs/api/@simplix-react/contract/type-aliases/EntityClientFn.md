[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / EntityClientFn

# Type Alias: EntityClientFn\<Role, Op, TSchema\>

> **EntityClientFn**\<`Role`, `Op`, `TSchema`\> = `Role` *extends* `"list"` ? (`parentIdOrParams?`, `params?`) => `Promise`\<[`InferEntityData`](InferEntityData.md)\<`TSchema`\>[]\> : `Role` *extends* `"get"` ? (`id`) => `Promise`\<[`InferEntityData`](InferEntityData.md)\<`TSchema`\>\> : `Role` *extends* `"create"` ? (`parentIdOrDto`, `dto?`) => `Promise`\<[`InferEntityData`](InferEntityData.md)\<`TSchema`\>\> : `Role` *extends* `"update"` ? (`id`, `dto`) => `Promise`\<[`InferEntityData`](InferEntityData.md)\<`TSchema`\>\> : `Role` *extends* `"delete"` ? (`id`) => `Promise`\<`void`\> : `Role` *extends* `"tree"` ? (`params?`) => `Promise`\<[`InferEntityData`](InferEntityData.md)\<`TSchema`\>\> : (...`args`) => `Promise`\<[`InferOpOutputData`](InferOpOutputData.md)\<`Op`, `TSchema`\>\>

Defined in: [packages/contract/src/types.ts:149](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L149)

Client method type for one entity operation, shaped by its resolved CRUD role.

## Type Parameters

### Role

`Role`

The resolved [CRUD role](ResolveRole.md).

### Op

`Op`

The operation definition.

### TSchema

`TSchema`

The entity's Zod schema.
