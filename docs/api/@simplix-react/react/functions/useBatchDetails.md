[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / useBatchDetails

# Function: useBatchDetails()

> **useBatchDetails**\<`TList`, `TDetail`\>(`listData`, `extractId`, `getQueryOptions`): `object`

Defined in: [use-batch-details.ts:32](https://github.com/simplix-react/simplix-react/blob/main/use-batch-details.ts#L32)

Fetches detail records for every item in a list query, using `useQueries` + `combine`.

Extracts IDs from each list item via `extractId`, builds one query per ID,
and returns the combined results. Skips items whose `extractId` returns `undefined`.

## Type Parameters

### TList

`TList`

The list item type (e.g. a summary row).

### TDetail

`TDetail`

The detail type fetched per ID.

## Parameters

### listData

Array of list items (or `undefined` while the list is loading).

`TList`[] | `undefined`

### extractId

(`item`) => `string` \| `undefined`

Function to pull a string ID from each list item.

### getQueryOptions

(`id`) => `object`

Factory that returns `{ queryKey, queryFn }` for a given ID.

## Returns

`object`

`{ data, isPending }` — `data` contains successfully resolved details;
  `isPending` is `true` while any detail query is still in flight.

### data

> **data**: `TDetail`[]

### isPending

> **isPending**: `boolean`

## Example

```ts
const { data: details, isPending } = useBatchDetails(
  scuList,
  (scu) => scu.id,
  (id) => ({
    queryKey: scuKeys.detail(id),
    queryFn: () => fetchScuDetail(id),
  }),
);
```
