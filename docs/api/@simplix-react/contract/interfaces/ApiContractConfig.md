[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / ApiContractConfig

# Interface: ApiContractConfig\<TEntities, TOperations\>

Defined in: [packages/contract/src/types.ts:294](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L294)

Configures a complete API contract with entities, operations, and shared settings.

Serves as the input to [defineApi](../functions/defineApi.md), grouping all entity and operation
definitions under a single domain namespace with a shared base path.

## Example

```ts
import { z } from "zod";
import { simpleQueryBuilder } from "@simplix-react/contract";
import type { ApiContractConfig } from "@simplix-react/contract";

const config: ApiContractConfig = {
  domain: "inventory",
  basePath: "/api/v1",
  entities: {
    product: {
      schema: productSchema,
      operations: {
        list:   { method: "GET",    path: "/products" },
        get:    { method: "GET",    path: "/products/:id" },
        create: { method: "POST",   path: "/products", input: createProductSchema },
        update: { method: "PATCH",  path: "/products/:id", input: updateProductSchema },
        delete: { method: "DELETE", path: "/products/:id" },
      },
    },
  },
  queryBuilder: simpleQueryBuilder,
};
```

## See

[defineApi](../functions/defineApi.md) for constructing a contract from this config.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, [`EntityDefinition`](EntityDefinition.md)\> = `Record`\<`string`, [`EntityDefinition`](EntityDefinition.md)\>

Map of entity names to their definitions.

### TOperations

`TOperations` *extends* `Record`\<`string`, [`OperationDefinition`](OperationDefinition.md)\> = `Record`\<`string`, [`OperationDefinition`](OperationDefinition.md)\>

Map of operation names to their definitions.

## Properties

### basePath

> **basePath**: `string`

Defined in: [packages/contract/src/types.ts:307](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L307)

Base URL path prepended to all entity and operation paths (e.g. `"/api/v1"`).

***

### domain

> **domain**: `string`

Defined in: [packages/contract/src/types.ts:305](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L305)

Logical domain name used as the root segment in query keys (e.g. `"inventory"`).

***

### entities

> **entities**: `TEntities`

Defined in: [packages/contract/src/types.ts:309](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L309)

Map of entity names to their operation-based definitions.

***

### operations?

> `optional` **operations**: `TOperations`

Defined in: [packages/contract/src/types.ts:311](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L311)

Optional map of standalone operation names to their definitions.

***

### queryBuilder?

> `optional` **queryBuilder**: [`QueryBuilder`](QueryBuilder.md)

Defined in: [packages/contract/src/types.ts:313](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L313)

Strategy for serializing list parameters (filters, sort, pagination) into URL search params.
