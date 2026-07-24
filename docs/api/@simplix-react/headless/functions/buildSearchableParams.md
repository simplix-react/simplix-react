[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / buildSearchableParams

# Function: buildSearchableParams()

> **buildSearchableParams**(`params`, `options?`): `Record`\<`string`, `unknown`\>

Defined in: [build-searchable-params.ts:40](https://github.com/simplix-react/simplix-react/blob/main/build-searchable-params.ts#L40)

Serialize list state into flat searchable query params.

## Parameters

### params

List state assembled by a list state machine.

[`SearchableListParams`](../interfaces/SearchableListParams.md) | `undefined`

### options?

[`BuildSearchableParamsOptions`](../interfaces/BuildSearchableParamsOptions.md)

Optional filter transformation.

## Returns

`Record`\<`string`, `unknown`\>

Flat query params ready for an Orval-generated list hook.

## Remarks

Implements the searchable backend conventions shared by every platform:
- Page: 1-based to 0-based (`page`).
- Size: `pagination.limit` to `size`.
- Sort: `{ field, direction }` to `["field.direction"]`.
- Filters: spread flat as `field.operator` keys, dropping `_search`,
  `undefined` / `null` / `""`, and empty arrays.
