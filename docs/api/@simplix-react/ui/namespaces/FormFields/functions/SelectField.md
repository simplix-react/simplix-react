[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / SelectField

# Function: SelectField()

> **SelectField**\<`T`\>(`__namedParameters`): `Element`

Defined in: packages/ui/src/fields/form/select-field.tsx:33

Dropdown select field built on Radix Select primitives.

## Type Parameters

### T

`T` *extends* `string` = `string`

## Parameters

### \_\_namedParameters

[`SelectFieldProps`](../interfaces/SelectFieldProps.md)\<`T`\>

## Returns

`Element`

## Example

```tsx
<SelectField
  label="Role"
  value={role}
  onChange={setRole}
  options={[
    { label: "Admin", value: "admin" },
    { label: "User", value: "user" },
  ]}
/>
```
