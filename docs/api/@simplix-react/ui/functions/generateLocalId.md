[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / generateLocalId

# Function: generateLocalId()

> **generateLocalId**(): `string`

Defined in: [packages/headless/dist/index.d.ts:707](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L707)

Generate a client-only id from a millisecond timestamp and a base36 random suffix.

## Returns

`string`

A local id string (e.g. `"1700000000000-a1b2c3d4e"`).

## Remarks

Stable enough for keys and toast ids; never sent to the server.
