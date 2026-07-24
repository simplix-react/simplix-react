[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / serializeWallClockTime

# Function: serializeWallClockTime()

> **serializeWallClockTime**(`time`, `opts?`): `string` \| `undefined`

Defined in: [rfc3339-date.ts:215](https://github.com/simplix-react/simplix-react/blob/main/rfc3339-date.ts#L215)

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
