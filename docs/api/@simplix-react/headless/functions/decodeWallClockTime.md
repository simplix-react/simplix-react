[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / decodeWallClockTime

# Function: decodeWallClockTime()

> **decodeWallClockTime**(`value`): [`TimeValue`](../interfaces/TimeValue.md) \| `undefined`

Defined in: [rfc3339-date.ts:229](https://github.com/simplix-react/simplix-react/blob/main/rfc3339-date.ts#L229)

Decode a textual `HH:mm[:ss]` into a [TimeValue](../interfaces/TimeValue.md) (seconds are dropped).

## Parameters

### value

`string` | `null` | `undefined`

## Returns

[`TimeValue`](../interfaces/TimeValue.md) \| `undefined`

the `TimeValue`, or `undefined` for a null/out-of-range/malformed input.
