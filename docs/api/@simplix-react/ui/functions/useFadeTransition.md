[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useFadeTransition

# Function: useFadeTransition()

> **useFadeTransition**(`options`): [`UseFadeTransitionResult`](../interfaces/UseFadeTransitionResult.md)

Defined in: packages/ui/src/crud/patterns/use-fade-transition.ts:34

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
