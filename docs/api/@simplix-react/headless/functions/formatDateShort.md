[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / formatDateShort

# Function: formatDateShort()

> **formatDateShort**(`date`, `locale?`, `timeZone?`): `string`

Defined in: [format-date.ts:85](https://github.com/simplix-react/simplix-react/blob/main/format-date.ts#L85)

Short date — e.g. "Mar 3" this year, "Mar 3, 2024" in any other, localized.

## Parameters

### date

`Date`

### locale?

`string`

### timeZone?

`string`

## Returns

`string`

## Remarks

The year is dropped only where the reader supplies it themselves. Inside the
current year "Mar 3" is unambiguous and the year is noise; outside it the same
string names the wrong day and nothing on the screen says so, so the year is
written. [formatDateRange](formatDateRange.md) carries the rule across both ends of a range.

Pass `timeZone` (IANA) to render an absolute `Date` in that zone instead of
the browser zone (site-scoped detail/display); omit it for zone-neutral use.
The zone decides which year counts as current, so a date near a year boundary
is judged in the same zone it is printed in.
