[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useBeforeUnload

# Function: useBeforeUnload()

> **useBeforeUnload**(`enabled`): `void`

Defined in: [packages/ui/src/crud/form/use-before-unload.ts:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-before-unload.ts#L14)

Register a `beforeunload` handler to warn users before leaving the page.

## Parameters

### enabled

`boolean`

Whether the handler is active (typically bound to form dirty state).

## Returns

`void`

## Example

```ts
const isDirty = useIsDirty(current, initial);
useBeforeUnload(isDirty);
```
