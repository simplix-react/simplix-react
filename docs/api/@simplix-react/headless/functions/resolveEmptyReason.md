[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / resolveEmptyReason

# Function: resolveEmptyReason()

> **resolveEmptyReason**(`input`): [`EmptyReason`](../type-aliases/EmptyReason.md) \| `null`

Defined in: [resolve-empty-reason.ts:50](https://github.com/simplix-react/simplix-react/blob/main/resolve-empty-reason.ts#L50)

Classify why a list renders no rows.

## Parameters

### input

[`ResolveEmptyReasonInput`](../interfaces/ResolveEmptyReasonInput.md)

Query and filter state of the list view.

## Returns

[`EmptyReason`](../type-aliases/EmptyReason.md) \| `null`

The empty reason, or `null` when rows are present or the first load
  is still in flight.

## Remarks

The order of the checks is the contract: a query that is not settled
successfully is reported as such (`"error"` or `"unavailable"`) before any
"empty result" reason is considered. React Query pauses a fetch whenever the
document is hidden or the browser reports offline, and a paused query looks
exactly like a successful empty one — `isLoading: false`, `error: null` — so
`isPaused` / `failureCount` are what keep a rejected or stalled query from
being rendered to the user as "no data".

## Example

```ts
const reason = resolveEmptyReason({
  hasRows: rows.length > 0,
  isLoading: query.isLoading,
  error: query.error,
  isPaused: query.isPaused,
  failureCount: query.failureCount,
  hasSearch: search !== "",
  hasFilters: activeFilterCount > 0,
});
```
