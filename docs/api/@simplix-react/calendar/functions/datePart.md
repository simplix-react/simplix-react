[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/calendar](../README.md) / datePart

# Function: datePart()

> **datePart**(`value`): `string`

Defined in: [helpers.ts:351](https://github.com/simplix-react/simplix-react/blob/main/helpers.ts#L351)

Returns the `yyyy-MM-dd` part of a backend date value. Backends serialize
date-only fields inconsistently (`"2026-01-01"` vs `"2026-01-01T00:00:00+09:00"`);
consumers must normalize before keying or constructing local dates.

## Parameters

### value

`string`

## Returns

`string`
