[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / asPlainDate

# Function: asPlainDate()

> **asPlainDate**(`d`): `Date`

Defined in: [packages/ui/src/utils/parse-date.ts:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/utils/parse-date.ts#L23)

Tag a Date so JSON serialization emits a zone-neutral calendar date
(local `yyyy-MM-dd`) instead of `Date.prototype.toJSON`'s UTC `toISOString()`.

## Parameters

### d

`Date`

## Returns

`Date`

## Remarks

Mutates and returns the SAME instance: an own, non-enumerable `toJSON`
shadows the prototype. Use ONLY for `LocalDate` (date-only, `format:date`)
values, NEVER for real timestamps (`Instant`/`LocalDateTime`).

The returned Date is a serialization carrier for a `string` (`format:date`)
field: it MUST reach `JSON.stringify` intact and MUST NOT be `String()`-coerced
or run through `structuredClone` / a deep clone (either strips the own `toJSON`
and reverts to the UTC prototype `toJSON`, re-introducing an off-by-one).
Callers MUST only pass a Date that is local-midnight of the intended day
(calendar-emitted `new Date(y, m, d)` or [parseDate](parseDate.md)'s date-only branch),
because the local getters read back the calendar day of that instance.
