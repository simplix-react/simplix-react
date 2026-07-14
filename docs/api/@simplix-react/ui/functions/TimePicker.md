[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TimePicker

# Function: TimePicker()

> **TimePicker**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/base/inputs/time-picker.tsx:544](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-picker.tsx#L544)

Standalone time-of-day input: hour/minute spinner boxes with an AM/PM
toggle, where focusing a box drops a scrollable option list open.
Shares its UI with the date picker's `showTime` mode.

## Parameters

### \_\_namedParameters

[`TimePickerProps`](../interfaces/TimePickerProps.md)

## Returns

`Element`

## Example

```tsx
<TimePicker value={time} onChange={setTime} minuteStep={5} />
```
