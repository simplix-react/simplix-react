[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ChipFilterProps

# Interface: ChipFilterProps\<T\>

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L26)

Props for the [ChipFilter](../functions/ChipFilter.md) component.

## Type Parameters

### T

`T` *extends* `string` \| `number` = `string`

## Properties

### field

> **field**: `string`

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L28)

Server filter key (e.g. `"holidayType.equals"`).

***

### gap?

> `optional` **gap**: `"none"` \| `"xs"` \| `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:34](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L34)

Space between chips.

#### Default Value

```ts
"xs"
```

***

### options

> **options**: [`ChipFilterOption`](ChipFilterOption.md)\<`T`\>[]

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L30)

Available options.

***

### state

> **state**: [`CrudListFilters`](CrudListFilters.md)

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:32](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L32)

CrudList filter state to read/write.
