[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / ApiContractConfig

# Interface: ApiContractConfig\<TEntities, TOperations\>

Defined in: [packages/contract/src/types.ts:186](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/contract/src/types.ts#L186)

Configures a complete API contract with entities, operations, and shared settings.

Serves as the input to [defineApi](../functions/defineApi.md), grouping all entity and operation
definitions under a single domain namespace with a shared base path.

## Example

```ts
import { z } from "zod";
import { simpleQueryBuilder } from "@simplix-react/contract";
import type { ApiContractConfig } from "@simplix-react/contract";

const config: ApiContractConfig = {
  domain: "project",
  basePath: "/api/v1",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({ id: z.string(), title: z.string() }),
      createSchema: z.object({ title: z.string() }),
      updateSchema: z.object({ title: z.string().optional() }),
    },
  },
  queryBuilder: simpleQueryBuilder,
};
```

## See

[defineApi](../functions/defineApi.md) for constructing a contract from this config.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, [`EntityDefinition`](EntityDefinition.md)\<`any`, `any`, `any`\>\> = `Record`\<`string`, [`EntityDefinition`](EntityDefinition.md)\>

Map of entity names to their definitions.

### TOperations

`TOperations` *extends* `Record`\<`string`, [`OperationDefinition`](OperationDefinition.md)\<`any`, `any`\>\> = `Record`\<`string`, [`OperationDefinition`](OperationDefinition.md)\>

Map of operation names to their definitions.

## Properties

### basePath

> **basePath**: `string`

Defined in: [packages/contract/src/types.ts:199](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/contract/src/types.ts#L199)

Base URL path prepended to all entity and operation paths (e.g. `"/api/v1"`).

***

### domain

> **domain**: `string`

Defined in: [packages/contract/src/types.ts:197](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/contract/src/types.ts#L197)

Logical domain name used as the root segment in query keys (e.g. `"project"`).

***

### entities

> **entities**: `TEntities`

Defined in: [packages/contract/src/types.ts:201](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/contract/src/types.ts#L201)

Map of entity names to their CRUD definitions.

***

### operations?

> `optional` **operations**: `TOperations`

Defined in: [packages/contract/src/types.ts:203](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/contract/src/types.ts#L203)

Optional map of custom operation names to their definitions.

***

### queryBuilder?

> `optional` **queryBuilder**: [`QueryBuilder`](QueryBuilder.md)

Defined in: [packages/contract/src/types.ts:205](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/contract/src/types.ts#L205)

Strategy for serializing list parameters (filters, sort, pagination) into URL search params.
