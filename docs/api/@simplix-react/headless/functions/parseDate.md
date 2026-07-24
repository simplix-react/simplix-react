[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / parseDate

# Function: parseDate()

> **parseDate**(`value`): `Date` \| `undefined`

Defined in: [parse-date.ts:49](https://github.com/simplix-react/simplix-react/blob/main/parse-date.ts#L49)

Parse a date-like value into a Date object.
Returns `undefined` for null, undefined, empty strings, or invalid dates.

Supported inputs:
- `Date` object (passed through if valid; a tag from [asPlainDate](asPlainDate.md) is preserved)
- Date-only ISO string (`"2024-01-15"`) — parsed as a LOCAL calendar date and
  tagged via [asPlainDate](asPlainDate.md), so seeds and display stay zone-neutral. (Note:
  `new Date("2024-01-15")` would parse as UTC midnight and shift a day west of UTC.)
- Datetime / offset-aware ISO string (`"2024-01-15T10:30:00Z"`) — parsed with the
  native `new Date(value)` (UTC/offset-aware), UNCHANGED and never tagged.
- Unix timestamp in milliseconds (`1705276800000`)
- Unix timestamp in seconds (`1705276800`) — auto-detected if value < 1e12

## Parameters

### value

[`DateLike`](../type-aliases/DateLike.md) | `null` | `undefined`

## Returns

`Date` \| `undefined`
