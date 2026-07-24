[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DateRangePicker

# Function: DateRangePicker()

> **DateRangePicker**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/base/inputs/date-range-picker.tsx:101](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-range-picker.tsx#L101)

Standalone date range picker with a popover calendar, preset ranges, and month/year dropdowns.

Range and preset picks edit a pending draft: they reach
[DateRangePickerProps.onChange](../interfaces/DateRangePickerProps.md#onchange) only when the user presses Select, and
Close (or an outside click) discards them. Reset clears the pending draft,
while the trigger's clear button clears the field immediately.

## Parameters

### \_\_namedParameters

[`DateRangePickerProps`](../interfaces/DateRangePickerProps.md)

## Returns

`Element`

## Example

```tsx
<DateRangePicker value={range} onChange={setRange} locale="ko" />
```
