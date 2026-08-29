[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / chipFilterValues

# Function: chipFilterValues()

> **chipFilterValues**\<`T`\>(`state`, `field`): readonly `T`[]

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:68](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L68)

What a chip row has narrowed to, for whoever consumes the narrowing.

<p>Exported because a chip row's value is an array and every consumer would otherwise widen it
by hand — and a consumer that reads it as a scalar gets `undefined` silently, leaving the row
lit and nothing narrowed. Reads the committed side, which is the one a query may use.

## Type Parameters

### T

`T` *extends* `string` \| `number` = `string`

the option value type

## Parameters

### state

[`CrudListFilters`](../interfaces/CrudListFilters.md)

the filter state the row writes to

### field

`string`

the same key the row was given

## Returns

readonly `T`[]

the chosen values, empty when the row narrows nothing
