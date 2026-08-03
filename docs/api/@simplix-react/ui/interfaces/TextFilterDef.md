[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TextFilterDef

# Interface: TextFilterDef

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:44](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L44)

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

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:47](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L47)

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

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:46](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L46)

***

### options?

> `optional` **options**: [`TextFilterOptionDef`](TextFilterOptionDef.md)[]

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:56](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L56)

Closed catalogue the value is picked from instead of typed. Use it for a column
the server matches literally — a constant key, a code — where a typo produces an
empty result the operator cannot tell from "no such row". The pick still travels
under the current operator, so a CONTAINS filter over a column packing several
keys keeps working.

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:48](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L48)

***

### type

> **type**: `"text"`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:45](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L45)
