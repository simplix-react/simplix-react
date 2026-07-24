[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useCrudList

# Function: useCrudList()

> **useCrudList**\<`T`\>(`useList`, `options?`): [`UseCrudListResult`](../interfaces/UseCrudListResult.md)\<`T`\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:121](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L121)

State management hook for CRUD list views.

## Type Parameters

### T

`T`

Row data type.

## Parameters

### useList

[`ListHook`](../interfaces/ListHook.md)\<`T`\>

Data fetching hook (e.g. Orval-generated `useListPets`).

### options?

[`UseCrudListOptions`](../interfaces/UseCrudListOptions.md)

Configuration for state mode, defaults, and filter behavior.

## Returns

[`UseCrudListResult`](../interfaces/UseCrudListResult.md)\<`T`\>

Unified state object for data, filters, sort, pagination, selection, and empty detection.

## Remarks

Handles filtering, sorting, pagination, and row selection with
support for both server-side and client-side data processing.
In `"server"` mode, filter/sort/pagination params are forwarded to the list hook.
In `"client"` mode, all processing happens in-memory.

This is the **headless escape hatch** for the list view: it returns the full
data/filter/sort/pagination/selection state so a consumer can render any
markup they want and still drive it with the framework's list engine — total
control without forking. This guarantee is **list-only**; the form and tree
views have no single equivalent hook, so their ceiling for deep customization
is per-instance slots / render-props (e.g. [ListTableSlots](../interfaces/ListTableSlots.md)), not a
headless hook.

## Example

```ts
const list = useCrudList(useListPets, {
  stateMode: "server",
  defaultPageSize: 20,
  defaultSort: { field: "name", direction: "asc" },
});

// Use in CrudList component
<CrudList.Table data={list.data} sort={list.sort} ... />
<CrudList.Pagination {...list.pagination} ... />
```
