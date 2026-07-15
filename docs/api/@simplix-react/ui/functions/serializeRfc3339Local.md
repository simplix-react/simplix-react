[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / serializeRfc3339Local

# Function: serializeRfc3339Local()

> **serializeRfc3339Local**(`date`): `string` \| `undefined`

Defined in: [packages/ui/src/utils/rfc3339-date.ts:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/utils/rfc3339-date.ts#L28)

Serialize a `Date` to canonical RFC 3339 using its LOCAL wall-clock fields and
the runtime's LOCAL offset (dynamic — `+09:00` for a KST client, `+00:00` for a
UTC client, etc.; never hard-coded). A local-midnight `new Date(2026, 6, 8)` in a
KST runtime yields `2026-07-08T00:00:00+09:00`; the day never shifts (unlike
`date.toISOString()`, which converts to UTC and can roll the day).

The input Date's time-of-day is preserved at seconds precision, so a caller that
has already applied a wall-clock shift (e.g. a device deactivation `-1 minute`)
gets `...T23:59:00±hh:mm`. Reads local getters only — the offset is derived from
Date.getTimezoneOffset (re-signed to east-positive).

## Parameters

### date

`Date` | `null` | `undefined`

## Returns

`string` \| `undefined`

the RFC 3339 string, or `undefined` for a null/undefined/invalid input.
