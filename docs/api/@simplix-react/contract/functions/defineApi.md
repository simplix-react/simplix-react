[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / defineApi

# Function: defineApi()

> **defineApi**\<`TEntities`, `TOperations`\>(`config`, `options?`): `object`

Defined in: [packages/contract/src/define-api.ts:62](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/contract/src/define-api.ts#L62)

Creates a fully-typed API contract from an [ApiContractConfig](../interfaces/ApiContractConfig.md).

Serves as the main entry point for `@simplix-react/contract`. Takes a
declarative config of entities and operations, then derives a type-safe
HTTP client and query key factories. The returned contract is consumed
by `@simplix-react/react` for hooks and `@simplix-react/mock` for MSW handlers.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, [`EntityDefinition`](../interfaces/EntityDefinition.md)\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `Record`\<`string`, [`EntityOperationDef`](../interfaces/EntityOperationDef.md)\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\>\>\>

Map of entity names to their [EntityDefinition](../interfaces/EntityDefinition.md)s.

### TOperations

`TOperations` *extends* `Record`\<`string`, [`OperationDefinition`](../interfaces/OperationDefinition.md)\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\> = `Record`\<`string`, `never`\>

Map of operation names to their [OperationDefinition](../interfaces/OperationDefinition.md)s.

## Parameters

### config

[`ApiContractConfig`](../interfaces/ApiContractConfig.md)\<`TEntities`, `TOperations`\>

The API contract configuration defining entities, operations, and shared settings.

### options?

Optional settings for customizing the contract.

#### fetchFn?

[`FetchFn`](../type-aliases/FetchFn.md)

Custom fetch function replacing the built-in [defaultFetch](defaultFetch.md).

## Returns

`object`

An [ApiContract](../interfaces/ApiContract.md) containing `config`, `client`, and `queryKeys`.

### client

> **client**: `Record`\<`string`, `unknown`\>

### config

> **config**: [`ApiContractConfig`](../interfaces/ApiContractConfig.md)\<`TEntities`, `TOperations`\>

### queryKeys

> **queryKeys**: \{ \[K in string \| number \| symbol\]: QueryKeyFactory \}

## Example

```ts
import { z } from "zod";
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";

const inventoryApi = defineApi({
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
});

// Type-safe client usage
const products = await inventoryApi.client.product.list();
const product = await inventoryApi.client.product.get("product-1");

// Query keys for TanStack Query
inventoryApi.queryKeys.product.all;       // ["inventory", "product"]
inventoryApi.queryKeys.product.detail("product-1"); // ["inventory", "product", "detail", "product-1"]
```

## See

 - [ApiContractConfig](../interfaces/ApiContractConfig.md) for the full config shape.
 - [deriveHooks](../../react/functions/deriveHooks.md) for deriving React Query hooks.
 - [deriveMockHandlers](../../mock/functions/deriveMockHandlers.md) for deriving MSW handlers.
