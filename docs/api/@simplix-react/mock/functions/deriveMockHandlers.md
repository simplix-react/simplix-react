[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / deriveMockHandlers

# Function: deriveMockHandlers()

> **deriveMockHandlers**\<`TEntities`, `TOperations`\>(`config`, `mockConfig?`): `HttpHandler`[]

Defined in: [derive-mock-handlers.ts:114](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/mock/src/derive-mock-handlers.ts#L114)

Derives MSW request handlers from an [@simplix-react/contract!ApiContractConfig](../../contract/interfaces/ApiContractConfig.md).

Generates a complete set of CRUD handlers for every entity defined in the contract:

- **GET list** — supports query-param filtering, sorting, and offset-based pagination
- **GET by id** — supports `belongsTo` relation loading via joins
- **POST create** — auto-generates a UUID `id` when not provided
- **PATCH update** — partial updates with automatic `updated_at` timestamp
- **DELETE** — removes the row by `id`

All handlers read from and write to the PGlite singleton managed by
[initPGlite](initPGlite.md)/[getPGliteInstance](getPGliteInstance.md).

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
import { projectContract } from "./contract";

const handlers = deriveMockHandlers(projectContract.config, {
  task: {
    tableName: "tasks",
    defaultLimit: 20,
    relations: {
      project: {
        table: "projects",
        localKey: "projectId",
        type: "belongsTo",
      },
    },
  },
});
```

## See

 - [MockEntityConfig](../interfaces/MockEntityConfig.md) - Per-entity configuration options.
 - [setupMockWorker](setupMockWorker.md) - High-level bootstrap that accepts these handlers.
 - [@simplix-react/contract!ApiContractConfig](../../contract/interfaces/ApiContractConfig.md) - The contract config shape.
