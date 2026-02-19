[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailBooleanField

# Function: DetailBooleanField()

> **DetailBooleanField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/detail/boolean-field.tsx:26](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/fields/detail/boolean-field.tsx#L26)

Read-only boolean display field. Shows Yes/No text or check/x icons.

## Parameters

### \_\_namedParameters

[`DetailBooleanFieldProps`](../interfaces/DetailBooleanFieldProps.md)

## Returns

`Element`

## Example

```tsx
<DetailBooleanField label="Active" value={user.isActive} />
<DetailBooleanField label="Verified" value={user.verified} mode="icon" />
```
