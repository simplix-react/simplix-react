[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DateRangeFilterProps

# Interface: DateRangeFilterProps

Defined in: [packages/ui/src/crud/filters/date-range-filter.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/date-range-filter.tsx#L13)

Props for the [DateRangeFilter](../functions/DateRangeFilter.md) component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/filters/date-range-filter.tsx:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/date-range-filter.tsx#L22)

***

### from

> **from**: `Date` \| `undefined`

Defined in: [packages/ui/src/crud/filters/date-range-filter.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/date-range-filter.tsx#L17)

Start date of the range, or `undefined` if unset.

***

### label

> **label**: `string`

Defined in: [packages/ui/src/crud/filters/date-range-filter.tsx:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/date-range-filter.tsx#L15)

Button label (e.g. `"Created"`, `"Updated"`).

***

### onChange()

> **onChange**: (`from?`, `to?`) => `void`

Defined in: [packages/ui/src/crud/filters/date-range-filter.tsx:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/date-range-filter.tsx#L21)

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

Defined in: [packages/ui/src/crud/filters/date-range-filter.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/date-range-filter.tsx#L19)

End date of the range, or `undefined` if unset.
