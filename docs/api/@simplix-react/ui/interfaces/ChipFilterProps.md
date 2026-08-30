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

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L35)

Server filter key.

<p>A chip row narrows to several values at once, so the key is the membership operator —
`"holidayType.in"` rather than `"holidayType.equals"`. The value written under it is an
array; a request builder that stringifies it produces the comma-separated list the
membership operator reads.

***

### gap?

> `optional` **gap**: `"none"` \| `"xs"` \| `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:41](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L41)

Space between chips.

#### Default Value

```ts
"xs"
```

***

### options

> **options**: [`ChipFilterOption`](ChipFilterOption.md)\<`T`\>[]

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:37](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L37)

Available options.

***

### state

> **state**: [`CrudListFilters`](CrudListFilters.md)

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:39](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L39)

CrudList filter state to read/write.
