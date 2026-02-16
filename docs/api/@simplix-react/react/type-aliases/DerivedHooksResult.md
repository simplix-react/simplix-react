[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / DerivedHooksResult

# Type Alias: DerivedHooksResult\<TEntities, TOperations\>

> **DerivedHooksResult**\<`TEntities`, `TOperations`\> = `{ [K in keyof TEntities]: EntityHooks<TEntities[K]["schema"], TEntities[K]["createSchema"], TEntities[K]["updateSchema"]> }` & `{ [K in keyof TOperations]: TOperations[K] extends OperationDefinition<infer TInput, infer TOutput> ? OperationHooks<TInput, TOutput> : never }`

Defined in: [derive-hooks.ts:429](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/react/src/derive-hooks.ts#L429)

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, `AnyEntityDef`\>

### TOperations

`TOperations` *extends* `Record`\<`string`, `AnyOperationDef`\>
