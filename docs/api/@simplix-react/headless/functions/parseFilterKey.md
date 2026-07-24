[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / parseFilterKey

# Function: parseFilterKey()

> **parseFilterKey**(`key`): \{ `field`: `string`; `operator`: `string`; \} \| `null`

Defined in: [filter-utils.ts:15](https://github.com/simplix-react/simplix-react/blob/main/filter-utils.ts#L15)

Parse a filter key back into field and operator.
Example: parseFilterKey("name.contains") -> { field: "name", operator: "contains" }

## Parameters

### key

`string`

## Returns

\{ `field`: `string`; `operator`: `string`; \} \| `null`
