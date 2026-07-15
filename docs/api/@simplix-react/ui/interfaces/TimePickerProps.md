[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TimePickerProps

# Interface: TimePickerProps

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:515](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L515)

Props for the [TimePicker](../functions/TimePicker.md) component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:531](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L531)

Additional class name for the wrapper.

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:529](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L529)

Disable the picker.

***

### hour12?

> `optional` **hour12**: `boolean`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:521](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L521)

Use a 12-hour clock with an AM/PM toggle. Set to `false` for a 24-hour clock.

#### Default Value

```ts
true
```

***

### maxTime?

> `optional` **maxTime**: [`TimeValue`](TimeValue.md)

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:527](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L527)

Latest selectable time. Out-of-range options are disabled and commits are clamped.

***

### minTime?

> `optional` **minTime**: [`TimeValue`](TimeValue.md)

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:525](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L525)

Earliest selectable time. Out-of-range options are disabled and commits are clamped.

***

### minuteStep?

> `optional` **minuteStep**: `number`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:523](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L523)

Interval between minute options in the option list. Direct input and the spinner still accept any minute.

#### Default Value

```ts
1
```

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:519](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L519)

Called with the new time on every change.

#### Parameters

##### value

[`TimeValue`](TimeValue.md)

#### Returns

`void`

***

### value

> **value**: [`TimeValue`](TimeValue.md) \| `undefined`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:517](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L517)

Currently selected time of day.
