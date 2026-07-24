[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / serializeWallClockTime

# Function: serializeWallClockTime()

> **serializeWallClockTime**(`time`, `opts?`): `string` \| `undefined`

Defined in: [packages/headless/dist/index.d.ts:580](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L580)

Serialize a wall-clock time to `HH:mm` (or `HH:mm:ss` with `opts.seconds`).

## Parameters

### time

[`TimeValue`](../interfaces/TimeValue.md) | `null` | `undefined`

### opts?

#### seconds?

`boolean`

## Returns

`string` \| `undefined`

the `HH:mm[:ss]` string, or `undefined` for a null/invalid input.
