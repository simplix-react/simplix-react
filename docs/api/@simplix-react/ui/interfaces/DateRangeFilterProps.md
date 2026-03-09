[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DateRangeFilterProps

# Interface: DateRangeFilterProps

Defined in: [packages/ui/src/crud/filters/date-range-filter.tsx:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/date-range-filter.tsx#L14)

Props for the [DateRangeFilter](../functions/DateRangeFilter.md) component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/filters/date-range-filter.tsx:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/date-range-filter.tsx#L23)

***

### from

> **from**: `Date` \| `undefined`

Defined in: [packages/ui/src/crud/filters/date-range-filter.tsx:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/date-range-filter.tsx#L18)

Start date of the range, or `undefined` if unset.

***

### label

> **label**: `string`

Defined in: [packages/ui/src/crud/filters/date-range-filter.tsx:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/date-range-filter.tsx#L16)

Button label (e.g. `"Created"`, `"Updated"`).

***

### onChange()

> **onChange**: (`from?`, `to?`) => `void`

Defined in: [packages/ui/src/crud/filters/date-range-filter.tsx:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/date-range-filter.tsx#L22)

Called when the user selects or clears a date range.

#### Parameters

##### from?

`Date`

##### to?

`Date`

#### Returns

`void`

***

### to

> **to**: `Date` \| `undefined`

Defined in: [packages/ui/src/crud/filters/date-range-filter.tsx:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/date-range-filter.tsx#L20)

End date of the range, or `undefined` if unset.
