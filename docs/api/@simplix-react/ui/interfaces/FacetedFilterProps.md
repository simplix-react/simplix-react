[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / FacetedFilterProps

# Interface: FacetedFilterProps

Defined in: [packages/ui/src/crud/filters/faceted-filter.tsx:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/faceted-filter.tsx#L35)

Props for the [FacetedFilter](../functions/FacetedFilter.md) component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/filters/faceted-filter.tsx:48](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/faceted-filter.tsx#L48)

***

### label

> **label**: `string`

Defined in: [packages/ui/src/crud/filters/faceted-filter.tsx:37](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/faceted-filter.tsx#L37)

Button label (e.g. `"Status"`, `"Category"`).

***

### maxDisplayCount?

> `optional` **maxDisplayCount**: `number`

Defined in: [packages/ui/src/crud/filters/faceted-filter.tsx:47](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/faceted-filter.tsx#L47)

Max badges to show before collapsing to count. Defaults to `5`.

***

### multiSelect?

> `optional` **multiSelect**: `boolean`

Defined in: [packages/ui/src/crud/filters/faceted-filter.tsx:45](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/faceted-filter.tsx#L45)

Enable multi-select mode. Defaults to `true`.

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/crud/filters/faceted-filter.tsx:41](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/faceted-filter.tsx#L41)

Called when selection changes.

#### Parameters

##### value

`string` | `string`[]

#### Returns

`void`

***

### options

> **options**: [`FacetedFilterOption`](FacetedFilterOption.md)[]

Defined in: [packages/ui/src/crud/filters/faceted-filter.tsx:43](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/faceted-filter.tsx#L43)

Available filter options.

***

### value

> **value**: `string` \| `string`[]

Defined in: [packages/ui/src/crud/filters/faceted-filter.tsx:39](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/faceted-filter.tsx#L39)

Currently selected value(s). String for single-select, string array for multi-select.
