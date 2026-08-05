[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / NumberFilterDef

# Interface: NumberFilterDef

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:59](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L59)

## Extends

- `FilterDefBase`

## Properties

### columnBreak?

> `optional` **columnBreak**: `boolean`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L35)

When the filter popover renders in multiple columns, start a new column at
this filter. Up to (columns - 1) flags take effect, in order; without flags
the fields are split evenly (column-major). Ignored in single-column layout.

#### Inherited from

`FilterDefBase.columnBreak`

***

### defaultOperator

> **defaultOperator**: [`SearchOperator`](../enumerations/SearchOperator.md)

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:62](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L62)

***

### field

> **field**: `string`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L28)

#### Inherited from

`FilterDefBase.field`

***

### label

> **label**: `string`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L29)

#### Inherited from

`FilterDefBase.label`

***

### operators

> **operators**: [`SearchOperator`](../enumerations/SearchOperator.md)[]

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:61](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L61)

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:63](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L63)

***

### type

> **type**: `"number"`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:60](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L60)
