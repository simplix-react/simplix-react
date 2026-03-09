[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / StaticField

# Function: StaticField()

> **StaticField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/form/static-field.tsx:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/static-field.tsx#L29)

Read-only display field that uses form-style label.
Use this instead of `DetailFields.*` when mixing read-only values
with editable fields in a form to keep label styling consistent.

## Parameters

### \_\_namedParameters

[`StaticFieldProps`](../interfaces/StaticFieldProps.md)

## Returns

`Element`

## Example

```tsx
<StaticField label="Address" value={device.osdpAddress} layout="inline" />
<StaticField label="Status" layout="inline">
  <Badge>Online</Badge>
</StaticField>
```
