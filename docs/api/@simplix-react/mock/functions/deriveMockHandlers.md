[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / deriveMockHandlers

# Function: deriveMockHandlers()

> **deriveMockHandlers**\<`TEntities`, `TOperations`\>(`config`, `mockConfig?`): `HttpHandler`[]

Defined in: [derive-mock-handlers.ts:117](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/mock/src/derive-mock-handlers.ts#L117)

Derives MSW request handlers from an [@simplix-react/contract!ApiContractConfig](../../contract/interfaces/ApiContractConfig.md).

Generates handlers for every operation in each entity based on its CRUD role:

- **list** (GET) — supports query-param filtering, sorting, and offset-based pagination
- **get** (GET) — supports `belongsTo` relation loading
- **create** (POST) — auto-generates a numeric `id` when not provided
- **update** (PATCH/PUT) — partial updates with automatic `updatedAt` timestamp
- **delete** (DELETE) — removes the record by `id`
- **tree** (GET) — returns recursive hierarchical data
- **custom** — returns default 200 response, or uses custom resolver if provided

All handlers read from and write to the in-memory store managed by
[getEntityStore](getEntityStore.md).

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, `AnyEntityDef`\>

The entities map from the contract config.

### TOperations

`TOperations` *extends* `Record`\<`string`, `AnyOperationDef`\>

The operations map from the contract config.

## Parameters

### config

[`ApiContractConfig`](../@simplix-react/contract/interfaces/ApiContractConfig.md)\<`TEntities`, `TOperations`\>

The API contract configuration object.

### mockConfig?

`Record`\<`string`, [`MockEntityConfig`](../interfaces/MockEntityConfig.md)\>

Optional per-entity mock configuration keyed by entity name.

## Returns

`HttpHandler`[]

An array of MSW `HttpHandler` instances ready for use with `setupWorker`.

## Example

```ts
import { deriveMockHandlers } from "@simplix-react/mock";
import { inventoryContract } from "./contract";

const handlers = deriveMockHandlers(inventoryContract.config, {
  product: { defaultLimit: 20 },
});
```

## See

 - [MockEntityConfig](../interfaces/MockEntityConfig.md) - Per-entity configuration options.
 - [setupMockWorker](setupMockWorker.md) - High-level bootstrap that accepts these handlers.
