[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useCrudPageState

# Function: useCrudPageState()

> **useCrudPageState**(`variant`, `nav`): [`UseCrudPageStateResult`](../interfaces/UseCrudPageStateResult.md)

Defined in: [packages/ui/src/crud/patterns/use-crud-page.ts:63](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/use-crud-page.ts#L63)

Composes fade transition and list-detail state from navigation result.

## Parameters

### variant

`"dialog"` | `"page"` | `"panel"`

### nav

[`UseCrudNavigationResult`](../interfaces/UseCrudNavigationResult.md)

## Returns

[`UseCrudPageStateResult`](../interfaces/UseCrudPageStateResult.md)

## Example

```tsx
const nav = useCrudNavigation(search, onNavigate);
const { state, fade, closePanel } = useCrudPageState(variant, nav);
```
