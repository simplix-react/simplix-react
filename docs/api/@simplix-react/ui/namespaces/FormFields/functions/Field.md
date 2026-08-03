[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / Field

# Function: Field()

> **Field**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/form/field.tsx:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/field.tsx#L24)

Generic field wrapper for custom content. Provides label, error,
and description display around arbitrary children.

Take the render-function form when the content has a control of its own —
it hands over the ids the label needs, which is what gives the control an
accessible name.

## Parameters

### \_\_namedParameters

[`FormFieldProps`](../interfaces/FormFieldProps.md)

## Returns

`Element`

## Example

```tsx
<Field label="Custom Widget" error={errors.widget}>
  {({ id }) => <MyCustomWidget id={id} value={val} onChange={setVal} />}
</Field>
```
