[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DatePickerProps

# Interface: DatePickerProps

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:64](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L64)

Props for the [DatePicker](../functions/DatePicker.md) component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:88](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L88)

Additional class name for the trigger button.

***

### clearable?

> `optional` **clearable**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:84](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L84)

Show clear button when a value is selected.

#### Default Value

```ts
true
```

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:86](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L86)

Disable the picker.

***

### displayZone?

> `optional` **displayZone**: `string`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:121](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L121)

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

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:123](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L123)

Optional label shown under the calendar, e.g. "Site time · Asia/Seoul". Defaults to the IANA id.

***

### endYear?

> `optional` **endYear**: `number`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:76](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L76)

End year for the year dropdown.

#### Default Value

```ts
current year + 10
```

***

### hour12?

> `optional` **hour12**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:101](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L101)

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

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:72](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L72)

Short locale code (e.g. `"ko"`, `"en"`, `"ja"`). Defaults to current i18n language.

***

### maxDate?

> `optional` **maxDate**: `Date`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:82](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L82)

Latest selectable date. When it carries a time of day, hour/minute options outside the range are disabled.

***

### minDate?

> `optional` **minDate**: `Date`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:80](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L80)

Earliest selectable date. When it carries a time of day, hour/minute options outside the range are disabled.

***

### minuteStep?

> `optional` **minuteStep**: `number`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:108](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L108)

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

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:68](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L68)

Called when the date changes.

#### Parameters

##### date

`Date` | `undefined`

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:70](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L70)

Placeholder text when no date is selected.

***

### reverseYears?

> `optional` **reverseYears**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:78](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L78)

Reverse year order in dropdown.

***

### showTime?

> `optional` **showTime**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:94](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L94)

Show time selection: an hour/minute spinner input row under the calendar.
Focusing the hour or minute box drops a scrollable option list open.

#### Default Value

```ts
false
```

***

### startYear?

> `optional` **startYear**: `number`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:74](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L74)

Start year for the year dropdown.

#### Default Value

```ts
current year - 10
```

***

### value

> **value**: `Date` \| `undefined`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:66](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L66)

Currently selected date.
