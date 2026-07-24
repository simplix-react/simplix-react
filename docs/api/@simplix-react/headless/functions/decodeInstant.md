[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / decodeInstant

# Function: decodeInstant()

> **decodeInstant**(`value`, `displayZone?`): `Date` \| `undefined`

Defined in: [rfc3339-date.ts:122](https://github.com/simplix-react/simplix-react/blob/main/rfc3339-date.ts#L122)

Parse an offset-aware / instant value and return a FLOATING `Date` whose LOCAL
fields equal the wall clock IN `displayZone` (so a picker renders the site's
wall clock in any viewer zone). Without `displayZone`, the true instant is
returned (legacy; the caller reads browser getters). Accepts a string,
number(ms), or Date.

## Parameters

### value

`string` | `number` | `Date` | `null` | `undefined`

### displayZone?

`string`

## Returns

`Date` \| `undefined`

the reprojected/true `Date`, or `undefined` for a null/invalid input.

## Remarks

The floating-carrier result's `getTime()` is the browser misreading of the
zone wall clock. Serialize it via [serializeInstant](serializeInstant.md) / [asZonedInstant](asZonedInstant.md)
(both read LOCAL fields), NEVER via `toISOString()` / `getTime()`.
