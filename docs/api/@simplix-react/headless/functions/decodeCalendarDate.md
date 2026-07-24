[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / decodeCalendarDate

# Function: decodeCalendarDate()

> **decodeCalendarDate**(`value`): `Date` \| `undefined`

Defined in: [rfc3339-date.ts:200](https://github.com/simplix-react/simplix-react/blob/main/rfc3339-date.ts#L200)

Decode a textual `yyyy-MM-dd` into a local-midnight floating `Date` tagged via
[asPlainDate](asPlainDate.md). Restores from the string's OWN components — NO local-getter
reinterpretation.

## Parameters

### value

`string` | `null` | `undefined`

## Returns

`Date` \| `undefined`

the tagged local-midnight `Date`, or `undefined` for a null/malformed input.
