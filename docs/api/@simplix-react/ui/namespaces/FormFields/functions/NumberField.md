[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / NumberField

# Function: NumberField()

> **NumberField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/form/number-field.tsx:31](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/number-field.tsx#L31)

Numeric input field with null handling for empty values and
always-visible spinner buttons.

## Parameters

### \_\_namedParameters

[`NumberFieldProps`](../interfaces/NumberFieldProps.md)

## Returns

`Element`

## Example

```tsx
<NumberField label="Age" value={age} onChange={setAge} min={0} max={150} />
```
