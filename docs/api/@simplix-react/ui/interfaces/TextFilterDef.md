[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TextFilterDef

# Interface: TextFilterDef

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:37](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L37)

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

### defaultOperator

> **defaultOperator**: [`SearchOperator`](../enumerations/SearchOperator.md)

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:40](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L40)

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

### operators

> **operators**: [`SearchOperator`](../enumerations/SearchOperator.md)[]

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:39](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L39)

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:41](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L41)

***

### type

> **type**: `"text"`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:38](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L38)
