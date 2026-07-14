[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / FacetedFilterDef

# Interface: FacetedFilterDef

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:51](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L51)

## Extends

- `FilterDefBase`

## Properties

### columnBreak?

> `optional` **columnBreak**: `boolean`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:34](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L34)

When the filter popover renders in multiple columns, start a new column at
this filter. Up to (columns - 1) flags take effect, in order; without flags
the fields are split evenly (column-major). Ignored in single-column layout.

#### Inherited from

`FilterDefBase.columnBreak`

***

### display?

> `optional` **display**: `"list"` \| `"dropdown"`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:60](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L60)

Presentation of the option list. "list" (default) renders the searchable
checkbox list inline; "dropdown" collapses it behind a combobox-style
trigger — use for long option sets such as entity/user pickers.

***

### field

> **field**: `string`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L27)

#### Inherited from

`FilterDefBase.field`

***

### label

> **label**: `string`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L28)

#### Inherited from

`FilterDefBase.label`

***

### multiSelect?

> `optional` **multiSelect**: `boolean`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:54](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L54)

***

### options

> **options**: `object`[]

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:53](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L53)

#### icon?

> `optional` **icon**: `ComponentType`\<\{ `className?`: `string`; \}\>

#### label

> **label**: `string`

#### value

> **value**: `string`

***

### type

> **type**: `"faceted"`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:52](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L52)
