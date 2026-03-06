[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useAutosave

# Function: useAutosave()

> **useAutosave**(`options`): [`UseAutosaveReturn`](../interfaces/UseAutosaveReturn.md)

Defined in: [packages/ui/src/crud/form/use-autosave.ts:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-autosave.ts#L49)

Debounced autosave hook that watches form values for changes.

## Parameters

### options

[`UseAutosaveOptions`](../interfaces/UseAutosaveOptions.md)

[UseAutosaveOptions](../interfaces/UseAutosaveOptions.md)

## Returns

[`UseAutosaveReturn`](../interfaces/UseAutosaveReturn.md)

Autosave status including `isSaving`, `lastSavedAt`, and `status`.

## Remarks

Automatically saves after a configurable debounce interval.
Skips save when the form has validation errors or when disabled.

## Example

```ts
const { isSaving, lastSavedAt } = useAutosave({
  values: formValues,
  onSave: (v) => updateEntity(v),
  debounceMs: 1500,
});
```
