[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / asZonedInstant

# Function: asZonedInstant()

> **asZonedInstant**(`date`, `displayZone`): `Date`

Defined in: [packages/headless/dist/index.d.ts:559](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L559)

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
