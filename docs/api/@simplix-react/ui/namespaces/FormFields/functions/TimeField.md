[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / TimeField

# Function: TimeField()

> **TimeField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/form/time-field.tsx:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/time-field.tsx#L36)

Time-of-day picker field: hour/minute spinner inputs with an AM/PM toggle
and drop-open option lists, wrapped with label/error/description.

## Parameters

### \_\_namedParameters

[`TimeFieldProps`](../interfaces/TimeFieldProps.md)

## Returns

`Element`

## Example

```tsx
<TimeField
  label="Opening Time"
  value={openTime}
  onChange={setOpenTime}
  minuteStep={5}
/>
```
