[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / decodeWallClockTime

# Function: decodeWallClockTime()

> **decodeWallClockTime**(`value`): [`TimeValue`](../interfaces/TimeValue.md) \| `undefined`

Defined in: [packages/headless/dist/index.d.ts:588](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L588)

Decode a textual `HH:mm[:ss]` into a [TimeValue](../interfaces/TimeValue.md) (seconds are dropped).

## Parameters

### value

`string` | `null` | `undefined`

## Returns

[`TimeValue`](../interfaces/TimeValue.md) \| `undefined`

the `TimeValue`, or `undefined` for a null/out-of-range/malformed input.
