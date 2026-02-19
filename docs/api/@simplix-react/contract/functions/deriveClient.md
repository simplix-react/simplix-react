[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / deriveClient

# Function: deriveClient()

> **deriveClient**\<`TEntities`, `TOperations`\>(`config`, `fetchFn?`): `Record`\<`string`, `unknown`\>

Defined in: [packages/contract/src/derive/client.ts:40](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/derive/client.ts#L40)

Derives a type-safe HTTP client from an [ApiContractConfig](../interfaces/ApiContractConfig.md).

Iterates over all entities and operations in the config and generates
corresponding client methods. Entity operations are generated dynamically
from the `operations` map. Each top-level operation produces a callable
function with positional path parameter arguments.

Typically called internally by [defineApi](defineApi.md) rather than used directly.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, [`EntityDefinition`](../interfaces/EntityDefinition.md)\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `Record`\<`string`, [`EntityOperationDef`](../interfaces/EntityOperationDef.md)\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\>\>\>

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
const products = await client.product.list();
```

## See

[defineApi](defineApi.md) for the recommended high-level API.
