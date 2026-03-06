[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / parseDate

# Function: parseDate()

> **parseDate**(`value`): `Date` \| `undefined`

Defined in: [packages/ui/src/utils/parse-date.ts:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/utils/parse-date.ts#L14)

Parse a date-like value into a Date object.
Returns `undefined` for null, undefined, empty strings, or invalid dates.

Supported inputs:
- `Date` object (passed through if valid)
- ISO 8601 string (`"2024-01-15"`, `"2024-01-15T10:30:00Z"`)
- Unix timestamp in milliseconds (`1705276800000`)
- Unix timestamp in seconds (`1705276800`) — auto-detected if value < 1e12

## Parameters

### value

[`DateLike`](../type-aliases/DateLike.md) | `null` | `undefined`

## Returns

`Date` \| `undefined`
