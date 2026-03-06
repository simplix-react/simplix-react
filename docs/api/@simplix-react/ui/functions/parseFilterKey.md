[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / parseFilterKey

# Function: parseFilterKey()

> **parseFilterKey**(`key`): \{ `field`: `string`; `operator`: `string`; \} \| `null`

Defined in: [packages/ui/src/crud/filters/filter-utils.ts:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-utils.ts#L15)

Parse a filter key back into field and operator.
Example: parseFilterKey("name.contains") -> { field: "name", operator: "contains" }

## Parameters

### key

`string`

## Returns

\{ `field`: `string`; `operator`: `string`; \} \| `null`
