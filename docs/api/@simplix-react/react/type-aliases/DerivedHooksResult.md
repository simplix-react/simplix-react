[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / DerivedHooksResult

# Type Alias: DerivedHooksResult\<TEntities, TOperations\>

> **DerivedHooksResult**\<`TEntities`, `TOperations`\> = `{ [K in keyof TEntities]: EntityHooks<TEntities[K]["schema"]> }` & `{ [K in keyof TOperations]: TOperations[K] extends OperationDefinition<infer TInput, infer TOutput> ? OperationHooks<TInput, TOutput> : never }`

Defined in: [derive-hooks.ts:534](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/react/src/derive-hooks.ts#L534)

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, `AnyEntityDef`\>

### TOperations

`TOperations` *extends* `Record`\<`string`, `AnyOperationDef`\>
