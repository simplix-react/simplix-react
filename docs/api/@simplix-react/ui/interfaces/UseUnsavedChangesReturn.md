[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseUnsavedChangesReturn

# Interface: UseUnsavedChangesReturn

Defined in: [packages/ui/src/crud/form/use-unsaved-changes.tsx:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-unsaved-changes.tsx#L15)

Return value of the [useUnsavedChanges](../functions/useUnsavedChanges.md) hook.

## Properties

### dialog

> **dialog**: `ReactNode`

Defined in: [packages/ui/src/crud/form/use-unsaved-changes.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-unsaved-changes.tsx#L19)

Alert dialog element to render in your component's JSX.

***

### guardedNavigate()

> **guardedNavigate**: (`callback`) => `void`

Defined in: [packages/ui/src/crud/form/use-unsaved-changes.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-unsaved-changes.tsx#L17)

Wrap navigation callbacks with this to show a confirmation dialog when dirty.

#### Parameters

##### callback

() => `void`

#### Returns

`void`
