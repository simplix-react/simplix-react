[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDelete

# Function: CrudDelete()

> **CrudDelete**(`props`): `Element`

Defined in: [packages/ui/src/crud/delete/crud-delete.tsx:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/delete/crud-delete.tsx#L49)

Delete confirmation dialog using Radix AlertDialog.

```
┌─────────────────────────────────┐
│ Delete user?                    │
│                                 │
│ This action cannot be undone.   │
│                                 │
│         [Cancel] [Delete]       │
└─────────────────────────────────┘
```

## Parameters

### props

[`CrudDeleteProps`](../interfaces/CrudDeleteProps.md)

[CrudDeleteProps](../interfaces/CrudDeleteProps.md)

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
