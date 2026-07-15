[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DateRangeFilterDef

# Interface: DateRangeFilterDef

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:67](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L67)

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

### dateOnly?

> `optional` **dateOnly**: `boolean`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:76](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L76)

Set for a `LocalDate` (`format:date`) column: the range boundaries are
serialized as zone-neutral `yyyy-MM-dd` (local) instead of a UTC ISO
timestamp, so date filtering matches the stored calendar date regardless
of the browser timezone. Leave unset (default) for `date-time` columns,
which keep full UTC ISO serialization.

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

### rfc3339Local?

> `optional` **rfc3339Local**: `boolean`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:83](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L83)

Set for a column stored as an offset-preserving canonical RFC 3339 `String`
(`yyyy-MM-ddT00:00:00±hh:mm`): the range boundaries are serialized in the SAME
canonical format (via [serializeRfc3339Local](../functions/serializeRfc3339Local.md)) so a lexicographic string
comparison equals chronological order. Takes precedence over [dateOnly](#dateonly).

***

### type

> **type**: `"dateRange"`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:68](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L68)
