[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DateRangePickerProps

# Interface: DateRangePickerProps

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:67](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L67)

Props for the [DateRangePicker](../functions/DateRangePicker.md) component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:90](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L90)

Additional class name for the trigger button.

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:88](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L88)

Disable the picker.

***

### id?

> `optional` **id**: `string`

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:72](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L72)

Id placed on the trigger button so an enclosing field label can point its
`htmlFor` at it — without it the label names nothing.

***

### locale?

> `optional` **locale**: `string`

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:80](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L80)

Short locale code (e.g. `"ko"`, `"en"`, `"ja"`). Defaults to current i18n language.

***

### numberOfMonths?

> `optional` **numberOfMonths**: `1` \| `2`

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:82](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L82)

Number of months to display.

#### Default Value

```ts
2
```

***

### onChange()

> **onChange**: (`range`) => `void`

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:76](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L76)

Called when the range changes.

#### Parameters

##### range

[`DateRange`](DateRange.md)

#### Returns

`void`

***

### onReset()?

> `optional` **onReset**: () => `void`

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:86](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L86)

Called when the field is cleared via the trigger's clear button. If not provided, onChange is called with an empty range.

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:78](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L78)

Placeholder text when no range is selected.

***

### value

> **value**: [`DateRange`](DateRange.md)

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:74](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L74)

Currently selected date range.

***

### yearsRange?

> `optional` **yearsRange**: `number`

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:84](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L84)

Years range around current year for dropdowns.

#### Default Value

```ts
10
```
