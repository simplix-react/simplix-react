[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DatePickerProps

# Interface: DatePickerProps

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:67](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L67)

Props for the [DatePicker](../functions/DatePicker.md) component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:91](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L91)

Additional class name for the trigger button.

***

### clearable?

> `optional` **clearable**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:87](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L87)

Show clear button when a value is selected.

#### Default Value

```ts
true
```

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:89](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L89)

Disable the picker.

***

### endYear?

> `optional` **endYear**: `number`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:79](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L79)

End year for the year dropdown.

#### Default Value

```ts
current year + 10
```

***

### hour12?

> `optional` **hour12**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:105](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L105)

Use a 12-hour clock with an AM/PM toggle. Set to `false` for a 24-hour
clock (the toggle is hidden and the hour list shows 0-23).
Only applies when [DatePickerProps.showTime](#showtime) is enabled.

#### Default Value

```ts
true
```

***

### locale?

> `optional` **locale**: `string`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:75](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L75)

Short locale code (e.g. `"ko"`, `"en"`, `"ja"`). Defaults to current i18n language.

***

### maxDate?

> `optional` **maxDate**: `Date`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:85](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L85)

Latest selectable date. When it carries a time of day, hour/minute options outside the range are disabled.

***

### minDate?

> `optional` **minDate**: `Date`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:83](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L83)

Earliest selectable date. When it carries a time of day, hour/minute options outside the range are disabled.

***

### minuteStep?

> `optional` **minuteStep**: `number`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:112](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L112)

Interval between minute options in the option list. Direct input and
the spinner still accept any minute.
Only applies when [DatePickerProps.showTime](#showtime) is enabled.

#### Default Value

```ts
1
```

***

### onChange()

> **onChange**: (`date`) => `void`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:71](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L71)

Called when the date changes.

#### Parameters

##### date

`Date` | `undefined`

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:73](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L73)

Placeholder text when no date is selected.

***

### reverseYears?

> `optional` **reverseYears**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:81](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L81)

Reverse year order in dropdown.

***

### showTime?

> `optional` **showTime**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:98](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L98)

Show time selection: an hour/minute spinner input row under the calendar.
Focusing the hour or minute box drops a scrollable option list open.
Selecting a day keeps the popover open so the time can be adjusted.

#### Default Value

```ts
false
```

***

### startYear?

> `optional` **startYear**: `number`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:77](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L77)

Start year for the year dropdown.

#### Default Value

```ts
current year - 10
```

***

### value

> **value**: `Date` \| `undefined`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:69](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L69)

Currently selected date.
