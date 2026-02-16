[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / deriveClient

# Function: deriveClient()

> **deriveClient**\<`TEntities`, `TOperations`\>(`config`, `fetchFn?`): `Record`\<`string`, `unknown`\>

Defined in: [packages/contract/src/derive/client.ts:37](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/contract/src/derive/client.ts#L37)

Derives a type-safe HTTP client from an [ApiContractConfig](../interfaces/ApiContractConfig.md).

Iterates over all entities and operations in the config and generates
corresponding CRUD methods and operation functions. Each entity produces
`list`, `get`, `create`, `update`, and `delete` methods. Each operation
produces a callable function with positional path parameter arguments.

Typically called internally by [defineApi](defineApi.md) rather than used directly.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, [`EntityDefinition`](../interfaces/EntityDefinition.md)\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\>

Map of entity names to their definitions.

### TOperations

`TOperations` *extends* `Record`\<`string`, [`OperationDefinition`](../interfaces/OperationDefinition.md)\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\>

Map of operation names to their definitions.

## Parameters

### config

[`ApiContractConfig`](../interfaces/ApiContractConfig.md)\<`TEntities`, `TOperations`\>

The API contract configuration.

### fetchFn?

[`FetchFn`](../type-aliases/FetchFn.md) = `defaultFetch`

Custom fetch function; defaults to [defaultFetch](defaultFetch.md).

## Returns

`Record`\<`string`, `unknown`\>

A client object with typed methods for each entity and operation.

## Example

```ts
import { deriveClient } from "@simplix-react/contract";

const client = deriveClient(config);
const tasks = await client.task.list();
```

## See

[defineApi](defineApi.md) for the recommended high-level API.
