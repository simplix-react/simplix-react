[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / RadioGroupField

# Function: RadioGroupField()

> **RadioGroupField**\<`T`\>(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/form/radio-group-field.tsx:40](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/fields/form/radio-group-field.tsx#L40)

Radio group field with support for option descriptions and horizontal/vertical layout.

## Type Parameters

### T

`T` *extends* `string` = `string`

## Parameters

### \_\_namedParameters

[`RadioGroupFieldProps`](../interfaces/RadioGroupFieldProps.md)\<`T`\>

## Returns

`Element`

## Example

```tsx
<RadioGroupField
  label="Plan"
  value={plan}
  onChange={setPlan}
  options={[
    { label: "Free", value: "free", description: "Basic features" },
    { label: "Pro", value: "pro", description: "All features" },
  ]}
/>
```
