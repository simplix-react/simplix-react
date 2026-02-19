[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useCrudDeleteDetail

# Function: useCrudDeleteDetail()

> **useCrudDeleteDetail**(): [`UseCrudDeleteDetailResult`](../interfaces/UseCrudDeleteDetailResult.md)

Defined in: [packages/ui/src/crud/delete/use-crud-delete.ts:59](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/delete/use-crud-delete.ts#L59)

Manages delete-confirmation state for a **detail** view (single item).

## Returns

[`UseCrudDeleteDetailResult`](../interfaces/UseCrudDeleteDetailResult.md)

## Example

```tsx
const del = useCrudDeleteDetail();
// trigger: del.requestDelete()
// <CrudDelete open={del.open} onOpenChange={del.onOpenChange} ... />
```
