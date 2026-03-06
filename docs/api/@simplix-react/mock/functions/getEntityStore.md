[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / getEntityStore

# Function: getEntityStore()

> **getEntityStore**(`storeName`): `Map`\<`string` \| `number`, `Record`\<`string`, `unknown`\>\>

Defined in: [mock-store.ts:26](https://github.com/simplix-react/simplix-react/blob/main/mock-store.ts#L26)

Returns the `Map` for the given store name, creating it lazily if needed.

## Parameters

### storeName

`string`

Unique identifier for the entity store.

## Returns

`Map`\<`string` \| `number`, `Record`\<`string`, `unknown`\>\>

The entity map keyed by record id.

## Example

```ts
import { getEntityStore } from "@simplix-react/mock";

const store = getEntityStore("pets");
store.set(1, { id: 1, name: "Buddy", status: "available" });
console.log(store.get(1)); // { id: 1, name: "Buddy", status: "available" }
```
