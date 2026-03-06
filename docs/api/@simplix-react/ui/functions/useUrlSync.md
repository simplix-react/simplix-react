[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useUrlSync

# Function: useUrlSync()

> **useUrlSync**(`options`): `void`

Defined in: [packages/ui/src/crud/list/use-url-sync.ts:113](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-url-sync.ts#L113)

Sync list state (filters, sort, pagination) with URL query parameters.

## Parameters

### options

[`UseUrlSyncOptions`](../interfaces/UseUrlSyncOptions.md)

[UseUrlSyncOptions](../interfaces/UseUrlSyncOptions.md)

## Returns

`void`

## Remarks

Reads initial state from URL on mount. Writes state changes to URL
with a 300ms debounce using `history.replaceState` (no page reload).

## Example

```ts
useUrlSync({
  filters: list.filters,
  sort: list.sort,
  pagination: list.pagination,
  setFilters: list.filters.setAll,
  setSort: list.sort.setSort,
  setPage: list.pagination.setPage,
});
```
