[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useFadeTransition

# Function: useFadeTransition()

> **useFadeTransition**(`options`): [`UseFadeTransitionResult`](../interfaces/UseFadeTransitionResult.md)

Defined in: [packages/ui/src/crud/patterns/use-fade-transition.ts:34](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/patterns/use-fade-transition.ts#L34)

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
