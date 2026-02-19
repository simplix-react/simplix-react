[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / getEntityStore

# Function: getEntityStore()

> **getEntityStore**(`storeName`): `Map`\<`string` \| `number`, `Record`\<`string`, `unknown`\>\>

Defined in: mock-store.ts:17

Returns the `Map` for the given store name, creating it lazily if needed.

## Parameters

### storeName

`string`

Unique identifier for the entity store.

## Returns

`Map`\<`string` \| `number`, `Record`\<`string`, `unknown`\>\>

The entity map keyed by record id.
