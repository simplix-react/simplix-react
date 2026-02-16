[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / ApiContract

# Interface: ApiContract\<TEntities, TOperations\>

Defined in: [packages/contract/src/types.ts:324](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/contract/src/types.ts#L324)

Represents the fully constructed API contract returned by [defineApi](../functions/defineApi.md).

Contains the original configuration, a type-safe HTTP client, and query key
factories for all registered entities. This is the primary interface consumed
by `@simplix-react/react` and `@simplix-react/mock`.

## See

 - [defineApi](../functions/defineApi.md) for constructing this contract.
 - [deriveHooks](../../react/functions/deriveHooks.md) for deriving React hooks.
 - [deriveMockHandlers](../../mock/functions/deriveMockHandlers.md) for deriving mock handlers.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, [`EntityDefinition`](EntityDefinition.md)\>

Map of entity names to their definitions.

### TOperations

`TOperations` *extends* `Record`\<`string`, [`OperationDefinition`](OperationDefinition.md)\>

Map of operation names to their definitions.

## Properties

### client

> **client**: \{ \[K in string \| number \| symbol\]: EntityClient\<TEntities\[K\]\["schema"\], TEntities\[K\]\["createSchema"\], TEntities\[K\]\["updateSchema"\]\> \} & \{ \[K in string \| number \| symbol\]: TOperations\[K\] extends OperationDefinition\<\_TInput, TOutput\> ? (args: unknown\[\]) =\> Promise\<output\<TOutput\>\> : never \}

Defined in: [packages/contract/src/types.ts:331](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/contract/src/types.ts#L331)

Type-safe HTTP client with methods for each entity and operation.

***

### config

> **config**: [`ApiContractConfig`](ApiContractConfig.md)\<`TEntities`, `TOperations`\>

Defined in: [packages/contract/src/types.ts:329](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/contract/src/types.ts#L329)

The original contract configuration.

***

### queryKeys

> **queryKeys**: \{ \[K in string \| number \| symbol\]: QueryKeyFactory \}

Defined in: [packages/contract/src/types.ts:346](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/contract/src/types.ts#L346)

Query key factories for cache management, one per entity.
