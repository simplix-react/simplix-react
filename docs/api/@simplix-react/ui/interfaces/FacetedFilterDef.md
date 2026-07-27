[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / FacetedFilterDef

# Interface: FacetedFilterDef

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

### display?

> `optional` **display**: `"list"` \| `"dropdown"`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:72](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L72)

Presentation of the option list. "list" (default) renders the searchable
checkbox list inline; "dropdown" collapses it behind a combobox-style
trigger — use for long option sets such as entity/user pickers.

***

### field

> **field**: `string`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L28)

#### Inherited from

`FilterDefBase.field`

***

### footer?

> `optional` **footer**: `ReactNode`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:94](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L94)

Rendered below the option list — e.g. a "more results" hint.

***

### label

> **label**: `string`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L29)

#### Inherited from

`FilterDefBase.label`

***

### loading?

> `optional` **loading**: `boolean`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:86](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L86)

Whether the query behind [onSearch](#onsearch) is in flight.

***

### multiSelect?

> `optional` **multiSelect**: `boolean`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:66](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L66)

***

### onSearch()?

> `optional` **onSearch**: (`query`) => `void`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:82](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L82)

Switches the filter to server search: what the operator types is debounced and
handed here instead of filtering [options](#options) locally, so a directory larger
than one page stays reachable. The caller answers by replacing `options` with
the matching page.

Pair it with [selectedOptions](#selectedoptions), or a value picked from an earlier page
loses its label as soon as the search text moves past it.

#### Parameters

##### query

`string`

#### Returns

`void`

***

### options

> **options**: [`FacetedFilterOptionDef`](FacetedFilterOptionDef.md)[]

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:65](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L65)

The values on offer. In server-search mode (see [onSearch](#onsearch)) this is the
current result page rather than the whole set.

***

### searchDebounceMs?

> `optional` **searchDebounceMs**: `number`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:84](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L84)

Debounce applied to [onSearch](#onsearch), in milliseconds. Default 300.

***

### selectedOptions?

> `optional` **selectedOptions**: [`FacetedFilterOptionDef`](FacetedFilterOptionDef.md)[]

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:92](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L92)

Labels for values that are selected but absent from the current [options](#options)
page. They head the option list and back the active-filter badge, so a selection
keeps its name instead of degrading to a raw id.

***

### type

> **type**: `"faceted"`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:60](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L60)
