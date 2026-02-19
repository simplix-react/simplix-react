[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / DateField

# Function: DateField()

> **DateField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/form/date-field.tsx:47](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/fields/form/date-field.tsx#L47)

Date picker field with calendar popover.

## Parameters

### \_\_namedParameters

[`DateFieldProps`](../interfaces/DateFieldProps.md)

## Returns

`Element`

## Example

```tsx
<DateField
  label="Birth Date"
  value={birthDate}
  onChange={setBirthDate}
  maxDate={new Date()}
/>
```
