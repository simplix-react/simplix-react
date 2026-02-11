[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/testing](../README.md) / createMockClient

# Function: createMockClient()

> **createMockClient**\<`TEntities`\>(`config`, `data`): `Record`\<`string`, `unknown`\>

Defined in: [mock-client.ts:39](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/testing/src/mock-client.ts#L39)

Creates an in-memory mock API client that mirrors the shape of a real
[ApiContract](../../contract/interfaces/ApiContract.md) client without requiring MSW or any network layer.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, `EntityDefinition`\<`any`, `any`, `any`\>\>

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

A record keyed by entity name, where each value exposes the standard
  CRUD methods (`list`, `get`, `create`, `update`, `delete`).

## Remarks

Each entity receives a record with `list`, `get`, `create`, `update`, and
`delete` methods backed by a plain array. Data mutations (create, update,
delete) modify the provided arrays in place, which makes it straightforward
to seed and inspect state within a single test.

This utility is ideal for unit testing React Query hooks in isolation, where
full HTTP mocking would add unnecessary overhead.

## Example

```ts
import { createMockClient } from "@simplix-react/testing";
import { contract } from "./my-contract";

const mockClient = createMockClient(contract.config, {
  users: [{ id: "1", name: "Alice" }],
});

const users = await mockClient.users.list();
// [{ id: "1", name: "Alice" }]

await mockClient.users.create({ name: "Bob" });
// users array now contains two items
```
