[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useCrudDeleteWired

# Function: useCrudDeleteWired()

> **useCrudDeleteWired**(`options`): [`UseCrudDeleteWiredResult`](../interfaces/UseCrudDeleteWiredResult.md)

Defined in: [packages/ui/src/crud/delete/use-crud-delete-wired.tsx:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/delete/use-crud-delete-wired.tsx#L49)

Combines [useCrudDeleteList](useCrudDeleteList.md) state + [CrudDelete](CrudDelete.md) rendering into
a single hook.  Eliminates the ~12-line boilerplate that every list/list-detail
page currently repeats.

## Parameters

### options

[`UseCrudDeleteWiredOptions`](../interfaces/UseCrudDeleteWiredOptions.md)

## Returns

[`UseCrudDeleteWiredResult`](../interfaces/UseCrudDeleteWiredResult.md)

## Example

```tsx
const { requestDelete, deleteDialog } = useCrudDeleteWired({
  deleteMutation: adaptOrvalDelete(useDeletePet(), "petId"),
  labels: {
    title: (t) => i18n("deletePetTitle"),
    description: (t) => i18n("deletePetDesc", { name: t.name }),
    cancel: i18n("cancel"),
    delete: i18n("delete"),
    deleting: i18n("deleting"),
  },
});
```
