[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useCrudNavigation

# Function: useCrudNavigation()

> **useCrudNavigation**(`search`, `onNavigate`): [`UseCrudNavigationResult`](../interfaces/UseCrudNavigationResult.md)

Defined in: [packages/ui/src/crud/patterns/use-crud-page.ts:31](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/use-crud-page.ts#L31)

Parses CRUD search params and returns memoized navigation callbacks.

## Parameters

### search

[`CrudSearch`](../interfaces/CrudSearch.md)

### onNavigate

(`search`) => `void`

## Returns

[`UseCrudNavigationResult`](../interfaces/UseCrudNavigationResult.md)

## Example

```tsx
const nav = useCrudNavigation(search, onNavigate);
const { view, selectedId, showList, showDetail } = nav;
```
