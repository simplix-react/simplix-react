[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailField

# Function: DetailField()

> **DetailField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/detail/field.tsx:22](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/fields/detail/field.tsx#L22)

Generic detail field wrapper for custom content.
Provides label display around arbitrary children.

## Parameters

### \_\_namedParameters

[`DetailFieldProps`](../interfaces/DetailFieldProps.md)

## Returns

`Element`

## Example

```tsx
<DetailField label="Permissions">
  <PermissionsList permissions={user.permissions} />
</DetailField>
```
