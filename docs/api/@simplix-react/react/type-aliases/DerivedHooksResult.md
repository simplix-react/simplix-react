[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / DerivedHooksResult

# Type Alias: DerivedHooksResult\<TEntities, TOperations\>

> **DerivedHooksResult**\<`TEntities`, `TOperations`\> = `{ [K in keyof TEntities]: EntityHooks<TEntities[K]["schema"]> }` & `{ [K in keyof TOperations]: TOperations[K] extends OperationDefinition<infer TInput, infer TOutput> ? OperationHooks<TInput, TOutput> : never }`

Defined in: [derive-hooks.ts:534](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/react/src/derive-hooks.ts#L534)

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, `AnyEntityDef`\>

### TOperations

`TOperations` *extends* `Record`\<`string`, `AnyOperationDef`\>
