[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TimePickerProps

# Interface: TimePickerProps

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:533](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L533)

Props for the [TimePicker](../functions/TimePicker.md) component.

## Properties

### aria-labelledby?

> `optional` **aria-labelledby**: `string`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:551](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L551)

Id of the element naming this picker — see TimeSelectControlProps.

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:549](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L549)

Additional class name for the wrapper.

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:547](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L547)

Disable the picker.

***

### hour12?

> `optional` **hour12**: `boolean`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:539](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L539)

Use a 12-hour clock with an AM/PM toggle. Set to `false` for a 24-hour clock.

#### Default Value

```ts
true
```

***

### maxTime?

> `optional` **maxTime**: [`TimeValue`](TimeValue.md)

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:545](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L545)

Latest selectable time. Out-of-range options are disabled and commits are clamped.

***

### minTime?

> `optional` **minTime**: [`TimeValue`](TimeValue.md)

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:543](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L543)

Earliest selectable time. Out-of-range options are disabled and commits are clamped.

***

### minuteStep?

> `optional` **minuteStep**: `number`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:541](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L541)

Interval between minute options in the option list. Direct input and the spinner still accept any minute.

#### Default Value

```ts
1
```

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:537](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L537)

Called with the new time on every change.

#### Parameters

##### value

[`TimeValue`](TimeValue.md)

#### Returns

`void`

***

### value

> **value**: [`TimeValue`](TimeValue.md) \| `undefined`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:535](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L535)

Currently selected time of day.
