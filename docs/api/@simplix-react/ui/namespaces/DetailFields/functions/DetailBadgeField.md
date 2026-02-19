[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailBadgeField

# Function: DetailBadgeField()

> **DetailBadgeField**\<`T`\>(`__namedParameters`): `Element`

Defined in: packages/ui/src/fields/detail/badge-field.tsx:34

Read-only badge display field. Maps values to badge color variants.

## Type Parameters

### T

`T` *extends* `string` = `string`

## Parameters

### \_\_namedParameters

[`DetailBadgeFieldProps`](../interfaces/DetailBadgeFieldProps.md)\<`T`\>

## Returns

`Element`

## Example

```tsx
<DetailBadgeField
  label="Status"
  value={user.status}
  variants={{ active: "success", inactive: "secondary", banned: "destructive" }}
/>
```
