[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useFadeTransition

# Function: useFadeTransition()

> **useFadeTransition**(`options`): [`UseFadeTransitionResult`](../interfaces/UseFadeTransitionResult.md)

Defined in: [packages/ui/src/crud/patterns/use-fade-transition.ts:34](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/patterns/use-fade-transition.ts#L34)

Drives a fade-out → swap → fade-in transition when the displayed
detail item changes.  Pairs naturally with [useListDetailState](useListDetailState.md).

## Parameters

### options

[`UseFadeTransitionOptions`](../interfaces/UseFadeTransitionOptions.md)

## Returns

[`UseFadeTransitionResult`](../interfaces/UseFadeTransitionResult.md)

## Example

```tsx
const state = useListDetailState();
const fade = useFadeTransition({
  active: state.view === "detail",
  targetId: state.selectedId,
});
```
