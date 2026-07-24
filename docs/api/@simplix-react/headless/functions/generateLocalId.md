[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / generateLocalId

# Function: generateLocalId()

> **generateLocalId**(): `string`

Defined in: [local-id.ts:9](https://github.com/simplix-react/simplix-react/blob/main/local-id.ts#L9)

Generate a client-only id from a millisecond timestamp and a base36 random suffix.

## Returns

`string`

A local id string (e.g. `"1700000000000-a1b2c3d4e"`).

## Remarks

Stable enough for keys and toast ids; never sent to the server.
