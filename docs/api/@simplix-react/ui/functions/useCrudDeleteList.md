[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useCrudDeleteList

# Function: useCrudDeleteList()

> **useCrudDeleteList**(): [`UseCrudDeleteListResult`](../interfaces/UseCrudDeleteListResult.md)

Defined in: [packages/ui/src/crud/delete/use-crud-delete.ts:30](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/delete/use-crud-delete.ts#L30)

Manages delete-confirmation state for a **list** view where the user
picks one row at a time to delete.

## Returns

[`UseCrudDeleteListResult`](../interfaces/UseCrudDeleteListResult.md)

## Example

```tsx
const del = useCrudDeleteList();
// trigger: del.requestDelete({ id: row.id, name: row.name })
// <CrudDelete open={del.open} onOpenChange={(o) => { if (!o) del.cancel(); }} ... />
```
