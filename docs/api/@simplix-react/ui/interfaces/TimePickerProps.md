[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TimePickerProps

# Interface: TimePickerProps

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:540](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L540)

Props for the [TimePicker](../functions/TimePicker.md) component.

## Properties

### aria-labelledby?

> `optional` **aria-labelledby**: `string`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:558](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L558)

Id of the element naming this picker — see TimeSelectControlProps.

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:556](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L556)

Additional class name for the wrapper.

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:554](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L554)

Disable the picker.

***

### hour12?

> `optional` **hour12**: `boolean`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:546](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L546)

Use a 12-hour clock with an AM/PM toggle. Set to `false` for a 24-hour clock.

#### Default Value

```ts
true
```

***

### maxTime?

> `optional` **maxTime**: [`TimeValue`](TimeValue.md)

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:552](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L552)

Latest selectable time. Out-of-range options are disabled and commits are clamped.

***

### minTime?

> `optional` **minTime**: [`TimeValue`](TimeValue.md)

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:550](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L550)

Earliest selectable time. Out-of-range options are disabled and commits are clamped.

***

### minuteStep?

> `optional` **minuteStep**: `number`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:548](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L548)

Interval between minute options in the option list. Direct input and the spinner still accept any minute.

#### Default Value

```ts
1
```

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:544](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L544)

Called with the new time on every change.

#### Parameters

##### value

[`TimeValue`](TimeValue.md)

#### Returns

`void`

***

### value

> **value**: [`TimeValue`](TimeValue.md) \| `undefined`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:542](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L542)

Currently selected time of day.
