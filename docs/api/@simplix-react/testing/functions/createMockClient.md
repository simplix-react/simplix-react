[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/testing](../README.md) / createMockClient

# Function: createMockClient()

> **createMockClient**\<`TEntities`\>(`config`, `data`): `Record`\<`string`, `unknown`\>

Defined in: [mock-client.ts:36](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/testing/src/mock-client.ts#L36)

Creates an in-memory mock API client that mirrors the shape of a real
[ApiContract](../../contract/interfaces/ApiContract.md) client without requiring MSW or any network layer.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, `EntityDefinition`\<`any`, `any`\>\>

The entity map derived from an [ApiContractConfig](../@simplix-react/contract/interfaces/ApiContractConfig.md).

## Parameters

### config

`Pick`\<[`ApiContractConfig`](../@simplix-react/contract/interfaces/ApiContractConfig.md)\<`TEntities`\>, `"entities"`\>

An object containing the `entities` definition from your API contract.

### data

`Record`\<`string`, `unknown`[]\>

A record whose keys match entity names and whose values are
  arrays of seed data. Missing keys default to an empty array.

## Returns

`Record`\<`string`, `unknown`\>

A record keyed by entity name, where each value exposes operation methods.

## Remarks

Each entity operation receives a mock function based on its CRUD role.
CRUD role operations (list, get, create, update, delete, tree) are backed
by a plain array. Non-CRUD operations return `null` by default.
Data mutations (create, update, delete) modify the provided arrays in place.

## Example

```ts
import { createMockClient } from "@simplix-react/testing";
import { contract } from "./my-contract";

const mockClient = createMockClient(contract.config, {
  product: [{ id: "1", name: "Widget" }],
});

const products = await mockClient.product.list();
// [{ id: "1", name: "Widget" }]

await mockClient.product.create({ name: "Gadget" });
// product array now contains two items
```
