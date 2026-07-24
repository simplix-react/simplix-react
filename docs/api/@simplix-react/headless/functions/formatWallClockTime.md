[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / formatWallClockTime

# Function: formatWallClockTime()

> **formatWallClockTime**(`value`, `locale?`): `string` \| `undefined`

Defined in: [rfc3339-date.ts:247](https://github.com/simplix-react/simplix-react/blob/main/rfc3339-date.ts#L247)

Format a wall-clock time — an `HH:mm[:ss]` string or a [TimeValue](../interfaces/TimeValue.md) — as a
localized time of day (AM/PM where the locale uses it), independent of any calendar
day or timezone. A fixed synthetic date carries the time into `Intl` purely for
formatting; only the time-of-day is meaningful.

## Parameters

### value

`string` | [`TimeValue`](../interfaces/TimeValue.md) | `null` | `undefined`

### locale?

`string`

## Returns

`string` \| `undefined`

the localized time, or `undefined` for a null/malformed input.
