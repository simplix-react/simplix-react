[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DateRangePickerProps

# Interface: DateRangePickerProps

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:69](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L69)

Props for the [DateRangePicker](../functions/DateRangePicker.md) component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:87](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L87)

Additional class name for the trigger button.

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:85](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L85)

Disable the picker.

***

### locale?

> `optional` **locale**: `string`

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:77](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L77)

Short locale code (e.g. `"ko"`, `"en"`, `"ja"`). Defaults to current i18n language.

***

### numberOfMonths?

> `optional` **numberOfMonths**: `1` \| `2`

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:79](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L79)

Number of months to display.

#### Default Value

```ts
2
```

***

### onChange()

> **onChange**: (`range`) => `void`

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:73](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L73)

Called when the range changes.

#### Parameters

##### range

[`DateRange`](DateRange.md)

#### Returns

`void`

***

### onReset()?

> `optional` **onReset**: () => `void`

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:83](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L83)

Called when reset is clicked. If not provided, onChange is called with empty range.

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:75](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L75)

Placeholder text when no range is selected.

***

### value

> **value**: [`DateRange`](DateRange.md)

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:71](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L71)

Currently selected date range.

***

### yearsRange?

> `optional` **yearsRange**: `number`

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:81](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L81)

Years range around current year for dropdowns.

#### Default Value

```ts
10
```
