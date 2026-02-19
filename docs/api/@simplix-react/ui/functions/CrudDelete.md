[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDelete

# Function: CrudDelete()

> **CrudDelete**(`__namedParameters`): `Element`

Defined in: packages/ui/src/crud/delete/crud-delete.tsx:37

Delete confirmation dialog using Radix AlertDialog.
Requires explicit user confirmation before deletion proceeds.

## Parameters

### \_\_namedParameters

[`CrudDeleteProps`](../interfaces/CrudDeleteProps.md)

## Returns

`Element`

## Example

```tsx
<CrudDelete
  open={showDelete}
  onOpenChange={setShowDelete}
  onConfirm={handleDelete}
  entityName="user"
  loading={isDeleting}
/>
```
