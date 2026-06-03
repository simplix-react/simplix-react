[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / EntityHookFor

# Type Alias: EntityHookFor\<Role, Op, TSchema\>

> **EntityHookFor**\<`Role`, `Op`, `TSchema`\> = `Role` *extends* `"list"` ? [`DerivedListHook`](DerivedListHook.md)\<`InferEntityData`\<`TSchema`\>\> : `Role` *extends* `"get"` ? [`DerivedGetHook`](DerivedGetHook.md)\<`InferEntityData`\<`TSchema`\>\> : `Role` *extends* `"create"` ? [`DerivedCreateHook`](DerivedCreateHook.md)\<`InferOpInput`\<`Op`\>, `InferEntityData`\<`TSchema`\>\> : `Role` *extends* `"update"` ? [`DerivedUpdateHook`](DerivedUpdateHook.md)\<`InferOpInput`\<`Op`\>, `InferEntityData`\<`TSchema`\>\> : `Role` *extends* `"delete"` ? [`DerivedDeleteHook`](DerivedDeleteHook.md) : `Role` *extends* `"tree"` ? [`DerivedTreeHook`](DerivedTreeHook.md)\<`InferEntityData`\<`TSchema`\>\> : `Op` *extends* `object` ? [`DerivedQueryHook`](DerivedQueryHook.md)\<`InferOpOutputData`\<`Op`, `TSchema`\>\> : [`OperationMutationHook`](OperationMutationHook.md)\<`InferOpInput`\<`Op`\>, `InferOpOutputData`\<`Op`, `TSchema`\>\>

Defined in: [types.ts:210](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L210)

Maps a single entity operation to its derived hook type, by resolved CRUD role.

## Type Parameters

### Role

`Role`

The resolved CRUD role (see `ResolveRole`)

### Op

`Op`

The operation definition

### TSchema

`TSchema` *extends* `z.ZodTypeAny`

The entity's Zod schema
