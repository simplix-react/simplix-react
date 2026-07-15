[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useFilterBarState

# Function: useFilterBarState()

> **useFilterBarState**(`options?`): [`CrudListFilters`](../interfaces/CrudListFilters.md)

Defined in: [packages/ui/src/crud/filters/use-filter-bar-state.ts:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/use-filter-bar-state.ts#L29)

Standalone filter state for a [FilterBar](FilterBar.md) that is not backed by
`useCrudList` — an aggregation report, a dashboard section, or any custom
query surface that still wants the standard search-popover chrome.

Implements the same deferred-apply contract as `useCrudList`'s filter state:
popover fields edit the pending `values`, `apply()` commits them, and badges
plus the consumer's query read `committedValues`.

## Parameters

### options?

[`UseFilterBarStateOptions`](../interfaces/UseFilterBarStateOptions.md)

## Returns

[`CrudListFilters`](../interfaces/CrudListFilters.md)

## Example

```tsx
const filters = useFilterBarState({ defaultFilters: { "period.greaterThanOrEqualTo": from } });
const companyId = String(filters.committedValues["companyId.in"] ?? "");
<FilterBar filters={defs} state={filters} count={rows.length} />
```
