[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DatePickerProps

# Interface: DatePickerProps

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:64](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L64)

Props for the [DatePicker](../functions/DatePicker.md) component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:93](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L93)

Additional class name for the trigger button.

***

### clearable?

> `optional` **clearable**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:89](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L89)

Show clear button when a value is selected.

#### Default Value

```ts
true
```

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:91](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L91)

Disable the picker.

***

### displayZone?

> `optional` **displayZone**: `string`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:126](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L126)

IANA display timezone. When set, the picker treats its value's local fields
as this zone's wall clock and renders a zone label; `Now` and the default
view month use this zone's clock.

#### Remarks

The incoming `value` must be a FLOATING `Date` whose local fields are the
display-zone wall clock (produced by the parent via `decodeInstant`). When
`displayZone` is set, `minDate`/`maxDate` should likewise be passed as
floating Dates in the same zone (or left undefined); mixing a floating value
with a true-instant bound compares misaligned clocks.

***

### displayZoneLabel?

> `optional` **displayZoneLabel**: `ReactNode`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:128](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L128)

Optional label shown under the calendar, e.g. "Site time · Asia/Seoul". Defaults to the IANA id.

***

### endYear?

> `optional` **endYear**: `number`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:81](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L81)

End year for the year dropdown.

#### Default Value

```ts
current year + 10
```

***

### hour12?

> `optional` **hour12**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:106](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L106)

Use a 12-hour clock with an AM/PM toggle. Set to `false` for a 24-hour
clock (the toggle is hidden and the hour list shows 0-23).
Only applies when [DatePickerProps.showTime](#showtime) is enabled.

#### Default Value

```ts
true
```

***

### id?

> `optional` **id**: `string`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:69](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L69)

Id placed on the trigger button so an enclosing field label can point its
`htmlFor` at it — without it the label names nothing.

***

### locale?

> `optional` **locale**: `string`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:77](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L77)

Short locale code (e.g. `"ko"`, `"en"`, `"ja"`). Defaults to current i18n language.

***

### maxDate?

> `optional` **maxDate**: `Date`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:87](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L87)

Latest selectable date. When it carries a time of day, hour/minute options outside the range are disabled.

***

### minDate?

> `optional` **minDate**: `Date`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:85](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L85)

Earliest selectable date. When it carries a time of day, hour/minute options outside the range are disabled.

***

### minuteStep?

> `optional` **minuteStep**: `number`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:113](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L113)

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

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:73](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L73)

Called when the date changes.

#### Parameters

##### date

`Date` | `undefined`

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:75](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L75)

Placeholder text when no date is selected.

***

### reverseYears?

> `optional` **reverseYears**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:83](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L83)

Reverse year order in dropdown.

***

### showTime?

> `optional` **showTime**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:99](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L99)

Show time selection: an hour/minute spinner input row under the calendar.
Focusing the hour or minute box drops a scrollable option list open.

#### Default Value

```ts
false
```

***

### startYear?

> `optional` **startYear**: `number`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:79](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L79)

Start year for the year dropdown.

#### Default Value

```ts
current year - 10
```

***

### value

> **value**: `Date` \| `undefined`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:71](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L71)

Currently selected date.
