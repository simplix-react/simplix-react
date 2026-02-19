[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / Field

# Function: Field()

> **Field**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/form/field.tsx:22](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/fields/form/field.tsx#L22)

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
