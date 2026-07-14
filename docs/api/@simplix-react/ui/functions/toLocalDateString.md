[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / toLocalDateString

# Function: toLocalDateString()

> **toLocalDateString**(`date`): `string`

Defined in: [packages/ui/src/utils/format-date.ts:65](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/utils/format-date.ts#L65)

Format a Date as a zone-neutral calendar date string `yyyy-MM-dd` using the
LOCAL calendar fields (never UTC). This is the single source for the
date-only wire format shared by [asPlainDate](asPlainDate.md)'s `toJSON` and any
hand-rolled DTO serialization of a `LocalDate` (`format:date`) field.

## Parameters

### date

`Date`

## Returns

`string`

## Remarks

Use this instead of `date.toISOString().slice(0, 10)`, which computes the
date in UTC and shifts by a day for local-midnight Dates east/west of UTC.
