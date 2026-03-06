[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / getNextId

# Function: getNextId()

> **getNextId**(`storeName`): `number`

Defined in: [mock-store.ts:51](https://github.com/simplix-react/simplix-react/blob/main/mock-store.ts#L51)

Returns the next auto-increment id for the given store and advances the counter.

## Parameters

### storeName

`string`

Unique identifier for the entity store.

## Returns

`number`

The next numeric id (starting from 1).

## Example

```ts
import { getNextId } from "@simplix-react/mock";

const id1 = getNextId("pets"); // 1
const id2 = getNextId("pets"); // 2
```
