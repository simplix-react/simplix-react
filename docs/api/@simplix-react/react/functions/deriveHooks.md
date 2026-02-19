[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / deriveHooks

# Function: deriveHooks()

> **deriveHooks**\<`TEntities`, `TOperations`\>(`contract`): [`DerivedHooksResult`](../type-aliases/DerivedHooksResult.md)\<`TEntities`, `TOperations`\>

Defined in: [derive-hooks.ts:75](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/react/src/derive-hooks.ts#L75)

Derives type-safe React Query hooks from an API contract.

Generates a complete set of hooks for every entity and operation defined in
the contract. Entity operations with CRUD roles produce specialized hooks
(`useList`, `useGet`, `useCreate`, `useUpdate`, `useDelete`, `useInfiniteList`).
Custom operations produce generic query or mutation hooks based on their HTTP method.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, `AnyEntityDef`\>

Record of entity definitions from the contract

### TOperations

`TOperations` *extends* `Record`\<`string`, `AnyOperationDef`\>

Record of operation definitions from the contract

## Parameters

### contract

The API contract produced by `defineApi()` from `@simplix-react/contract`,
  containing `config`, `client`, and `queryKeys`.

#### client

`Record`\<`string`, `unknown`\>

#### config

[`ApiContractConfig`](../@simplix-react/contract/interfaces/ApiContractConfig.md)\<`TEntities`, `TOperations`\>

#### queryKeys

`Record`\<`string`, `QueryKeyFactory`\>

## Returns

[`DerivedHooksResult`](../type-aliases/DerivedHooksResult.md)\<`TEntities`, `TOperations`\>

An object keyed by entity/operation name, each containing its derived hooks.

## Example

```ts
import { defineApi } from "@simplix-react/contract";
import { deriveHooks } from "@simplix-react/react";

const inventoryContract = defineApi({
  domain: "inventory",
  basePath: "/api",
  entities: {
    product: {
      schema: productSchema,
      operations: {
        list:   { method: "GET",    path: "/products" },
        get:    { method: "GET",    path: "/products/:id" },
        create: { method: "POST",   path: "/products", input: createProductSchema },
        update: { method: "PATCH",  path: "/products/:id", input: updateProductSchema },
        delete: { method: "DELETE", path: "/products/:id" },
        archive: { method: "POST",  path: "/products/:id/archive" },
      },
    },
  },
});

const hooks = deriveHooks(inventoryContract);

// CRUD hooks
hooks.product.useList();
hooks.product.useGet("id-1");
hooks.product.useCreate();

// Custom operation hooks
hooks.product.useArchive();
```

## See

 - [EntityHooks](../type-aliases/EntityHooks.md) for the per-entity hook interface.
 - [OperationHooks](../interfaces/OperationHooks.md) for the per-operation hook interface.
