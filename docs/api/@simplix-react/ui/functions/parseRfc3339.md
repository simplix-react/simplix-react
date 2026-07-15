[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / parseRfc3339

# Function: parseRfc3339()

> **parseRfc3339**(`value`): `Date` \| `undefined`

Defined in: [packages/ui/src/utils/rfc3339-date.ts:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/utils/rfc3339-date.ts#L49)

Parse an offset-aware RFC 3339 string (as produced by [serializeRfc3339Local](serializeRfc3339Local.md))
into a `Date` via the native offset-aware parser. The absolute instant is exact; a
caller reads LOCAL getters to recover the wall-clock the writer intended (correct
under a single-zone deployment where the viewer offset equals the stored offset).

## Parameters

### value

`string` | `null` | `undefined`

## Returns

`Date` \| `undefined`

the `Date`, or `undefined` for a null/undefined/empty/invalid input.
