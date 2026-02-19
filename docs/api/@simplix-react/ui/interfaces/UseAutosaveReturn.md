[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseAutosaveReturn

# Interface: UseAutosaveReturn

Defined in: packages/ui/src/crud/form/use-autosave.ts:21

Return value of the [useAutosave](../functions/useAutosave.md) hook.

## Properties

### isSaving

> **isSaving**: `boolean`

Defined in: packages/ui/src/crud/form/use-autosave.ts:25

Whether a save operation is currently in progress.

***

### lastSavedAt

> **lastSavedAt**: `Date` \| `null`

Defined in: packages/ui/src/crud/form/use-autosave.ts:23

Timestamp of the last successful save, or null if never saved.

***

### status

> **status**: [`AutosaveStatus`](../type-aliases/AutosaveStatus.md)

Defined in: packages/ui/src/crud/form/use-autosave.ts:27

Current autosave status.
