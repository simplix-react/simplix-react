[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / asZonedInstant

# Function: asZonedInstant()

> **asZonedInstant**(`date`, `displayZone`): `Date`

Defined in: [rfc3339-date.ts:168](https://github.com/simplix-react/simplix-react/blob/main/rfc3339-date.ts#L168)

Tag a FLOATING instant `Date` (local fields = display-zone wall clock) so JSON
serialization emits [serializeInstant](serializeInstant.md)(this, displayZone). Reads LOCAL
fields for `toJSON` — its `getTime()` is intentionally the browser misreading
and must never be used for serialization.

## Parameters

### date

`Date`

### displayZone

`string`

## Returns

`Date`

## Remarks

Same caveat as [asPlainDate](asPlainDate.md): survives object spread, NOT
`String()` / `structuredClone`. Mutates and returns the SAME instance.
