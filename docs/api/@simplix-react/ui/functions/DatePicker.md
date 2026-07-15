[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DatePicker

# Function: DatePicker()

> **DatePicker**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:126](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L126)

Standalone date picker with a popover calendar and month/year dropdowns.
With [DatePickerProps.showTime](../interfaces/DatePickerProps.md#showtime) it also renders an hour/minute
spinner input row (with AM/PM toggle) whose fields drop scrollable
option lists open on focus.

## Parameters

### \_\_namedParameters

[`DatePickerProps`](../interfaces/DatePickerProps.md)

## Returns

`Element`

## Example

```tsx
<DatePicker value={date} onChange={setDate} locale="ko" showTime />
```
