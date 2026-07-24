[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / decodeCalendarDate

# Function: decodeCalendarDate()

> **decodeCalendarDate**(`value`): `Date` \| `undefined`

Defined in: [packages/headless/dist/index.d.ts:574](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L574)

Decode a textual `yyyy-MM-dd` into a local-midnight floating `Date` tagged via
[asPlainDate](asPlainDate.md). Restores from the string's OWN components — NO local-getter
reinterpretation.

## Parameters

### value

`string` | `null` | `undefined`

## Returns

`Date` \| `undefined`

the tagged local-midnight `Date`, or `undefined` for a null/malformed input.
