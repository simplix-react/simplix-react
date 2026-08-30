[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / formatDateRange

# Function: formatDateRange()

> **formatDateRange**(`from`, `to`, `locale?`, `timeZone?`): `string` \| `null`

Defined in: [format-date.ts:167](https://github.com/simplix-react/simplix-react/blob/main/format-date.ts#L167)

Format a date range as a short string — e.g. "Mar 3 – Mar 27", localized.
Returns `null` when both `from` and `to` are undefined.

## Parameters

### from

`Date` | `undefined`

### to

`Date` | `undefined`

### locale?

`string`

### timeZone?

`string`

## Returns

`string` \| `null`

## Remarks

Both ends carry the year or neither does, and neither only when both ends fall
in the current year. Deciding each end on its own would write "Dec 20, 2025 –
Jan 5" for a range that crosses new year, where the unmarked end reads as
belonging to the year the marked one names.
