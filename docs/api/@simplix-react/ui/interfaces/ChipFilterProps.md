[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ChipFilterProps

# Interface: ChipFilterProps\<T\>

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L20)

Props for the [ChipFilter](../functions/ChipFilter.md) component.

## Type Parameters

### T

`T` *extends* `string` \| `number` = `string`

## Properties

### columns?

> `optional` **columns**: `1` \| `2` \| `3` \| `4` \| `6` \| `5`

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L28)

Grid columns.

#### Default Value

```ts
4
```

***

### field

> **field**: `string`

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L22)

Server filter key (e.g. `"holidayType.equals"`).

***

### gap?

> `optional` **gap**: `"none"` \| `"xs"` \| `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L30)

Grid gap.

#### Default Value

```ts
"xs"
```

***

### options

> **options**: [`ChipFilterOption`](ChipFilterOption.md)\<`T`\>[]

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L24)

Available options.

***

### state

> **state**: [`CrudListFilters`](CrudListFilters.md)

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L26)

CrudList filter state to read/write.
