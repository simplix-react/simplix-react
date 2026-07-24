[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / serializeInstant

# Function: serializeInstant()

> **serializeInstant**(`date`, `displayZone?`): `string` \| `undefined`

Defined in: [packages/headless/dist/index.d.ts:520](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L520)

Serialize an absolute instant to `yyyy-MM-ddTHH:mm:ss±HH:MM`.

With `displayZone` (IANA), the value's LOCAL wall-clock fields are interpreted
IN that zone and the offset is that zone's offset at that wall clock (NOT the
browser's). Without `displayZone`, the browser offset is stamped (legacy path
for non-site instants).

## Parameters

### date

`Date` | `null` | `undefined`

### displayZone?

`string`

## Returns

`string` \| `undefined`

the RFC 3339 string, or `undefined` for a null/undefined/invalid input.
