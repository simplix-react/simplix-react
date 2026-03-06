[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useUnsavedChanges

# Function: useUnsavedChanges()

> **useUnsavedChanges**(`options`): [`UseUnsavedChangesReturn`](../interfaces/UseUnsavedChangesReturn.md)

Defined in: [packages/ui/src/crud/form/use-unsaved-changes.tsx:46](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-unsaved-changes.tsx#L46)

Guard navigation with an unsaved changes confirmation dialog.

## Parameters

### options

[`UseUnsavedChangesOptions`](../interfaces/UseUnsavedChangesOptions.md)

[UseUnsavedChangesOptions](../interfaces/UseUnsavedChangesOptions.md)

## Returns

[`UseUnsavedChangesReturn`](../interfaces/UseUnsavedChangesReturn.md)

`guardedNavigate` wrapper and a `dialog` ReactNode to render.

## Remarks

Combines `useBeforeUnload` (browser tab close) with an in-app
alert dialog for programmatic navigation (e.g. route changes).

## Example

```tsx
const { guardedNavigate, dialog } = useUnsavedChanges({ isDirty });

const handleClose = () => guardedNavigate(() => router.back());

return (
  <>
    <CrudForm onClose={handleClose}>...</CrudForm>
    {dialog}
  </>
);
```
