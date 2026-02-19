[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useCrudDeleteDetail

# Function: useCrudDeleteDetail()

> **useCrudDeleteDetail**(): [`UseCrudDeleteDetailResult`](../interfaces/UseCrudDeleteDetailResult.md)

Defined in: packages/ui/src/crud/delete/use-crud-delete.ts:59

Manages delete-confirmation state for a **detail** view (single item).

## Returns

[`UseCrudDeleteDetailResult`](../interfaces/UseCrudDeleteDetailResult.md)

## Example

```tsx
const del = useCrudDeleteDetail();
// trigger: del.requestDelete()
// <CrudDelete open={del.open} onOpenChange={del.onOpenChange} ... />
```
