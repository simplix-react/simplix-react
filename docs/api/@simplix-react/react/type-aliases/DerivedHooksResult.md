[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / DerivedHooksResult

# Type Alias: DerivedHooksResult\<TEntities, TOperations\>

> **DerivedHooksResult**\<`TEntities`, `TOperations`\> = `{ [K in keyof TEntities]: EntityHooks<TEntities[K]["schema"], TEntities[K]["createSchema"], TEntities[K]["updateSchema"]> }` & `{ [K in keyof TOperations]: TOperations[K] extends OperationDefinition<infer TInput, infer TOutput> ? OperationHooks<TInput, TOutput> : never }`

Defined in: [derive-hooks.ts:429](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/react/src/derive-hooks.ts#L429)

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, `AnyEntityDef`\>

### TOperations

`TOperations` *extends* `Record`\<`string`, `AnyOperationDef`\>
