[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / Field

# Function: Field()

> **Field**(`__namedParameters`): `Element`

Defined in: packages/ui/src/fields/form/field.tsx:22

Generic field wrapper for custom content. Provides label, error,
and description display around arbitrary children.

## Parameters

### \_\_namedParameters

[`FormFieldProps`](../interfaces/FormFieldProps.md)

## Returns

`Element`

## Example

```tsx
<Field label="Custom Widget" error={errors.widget}>
  <MyCustomWidget value={val} onChange={setVal} />
</Field>
```
