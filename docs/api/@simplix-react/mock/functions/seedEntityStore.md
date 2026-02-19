[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / seedEntityStore

# Function: seedEntityStore()

> **seedEntityStore**(`storeName`, `records`): `void`

Defined in: [mock-store.ts:48](https://github.com/simplix-react/simplix-react/blob/main/mock-store.ts#L48)

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
