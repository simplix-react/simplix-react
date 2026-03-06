[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / seedEntityStore

# Function: seedEntityStore()

> **seedEntityStore**(`storeName`, `records`): `void`

Defined in: [mock-store.ts:78](https://github.com/simplix-react/simplix-react/blob/main/mock-store.ts#L78)

Loads an array of records into the store and sets the auto-increment counter
to one past the maximum numeric id found.

## Parameters

### storeName

`string`

Unique identifier for the entity store.

### records

`Record`\<`string`, `unknown`\>[]

The records to seed. Each must have an `id` field.

## Returns

`void`

## Example

```ts
import { seedEntityStore, getEntityStore } from "@simplix-react/mock";

seedEntityStore("pets", [
  { id: 1, name: "Buddy", status: "available" },
  { id: 2, name: "Max", status: "pending" },
]);

const store = getEntityStore("pets");
console.log(store.size); // 2
```
