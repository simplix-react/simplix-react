[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TimezoneFilterDef

# Interface: TimezoneFilterDef

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:90](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L90)

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

### type

> **type**: `"timezone"`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:91](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L91)
