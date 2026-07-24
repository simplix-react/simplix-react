[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DateRangeFilterDef

# Interface: DateRangeFilterDef

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:68](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L68)

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

### dateOnly?

> `optional` **dateOnly**: `boolean`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:77](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L77)

Set for a `LocalDate` (`format:date`) column: the range boundaries are
serialized as zone-neutral `yyyy-MM-dd` (local) instead of a UTC ISO
timestamp, so date filtering matches the stored calendar date regardless
of the browser timezone. Leave unset (default) for `date-time` columns,
which keep full UTC ISO serialization.

***

### displayZone?

> `optional` **displayZone**: `string`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:85](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L85)

Set for a site-scoped `Instant` column whose day boundaries must be computed
in the site zone: the picked day's start-of-day / end-of-day are interpreted
IN this IANA zone and sent as offset-bearing instants (via
[serializeInstant](../functions/serializeInstant.md)), so the fetched window is identical in any browser
zone. Takes precedence over [dateOnly](#dateonly).

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

### type

> **type**: `"dateRange"`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:69](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L69)
