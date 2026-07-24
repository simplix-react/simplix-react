[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / serializeCalendarDate

# Function: serializeCalendarDate()

> **serializeCalendarDate**(`date`): `string` \| `undefined`

Defined in: [rfc3339-date.ts:188](https://github.com/simplix-react/simplix-react/blob/main/rfc3339-date.ts#L188)

Serialize a calendar date to bare `yyyy-MM-dd` from LOCAL fields (zone-neutral).
Canonical name for [toLocalDateString](toLocalDateString.md).

## Parameters

### date

`Date` | `null` | `undefined`

## Returns

`string` \| `undefined`

the `yyyy-MM-dd` string, or `undefined` for a null/undefined/invalid input.
