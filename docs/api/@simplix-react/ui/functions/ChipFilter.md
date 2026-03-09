[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ChipFilter

# Function: ChipFilter()

> **ChipFilter**\<`T`\>(`__namedParameters`): `Element`

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:51](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L51)

Toggle chip grid that integrates with [CrudListFilters](../interfaces/CrudListFilters.md) for server-side filtering.

Single-select toggle: clicking an active chip deselects it (shows all).

## Type Parameters

### T

`T` *extends* `string` \| `number` = `string`

## Parameters

### \_\_namedParameters

[`ChipFilterProps`](../interfaces/ChipFilterProps.md)\<`T`\>

## Returns

`Element`

## Example

```tsx
<CrudList.ChipFilter
  field="status.equals"
  columns={3}
  state={list.filters}
  options={[
    { value: "active", label: "Active", icon: <StatusDot color="green" /> },
    { value: "inactive", label: "Inactive", icon: <StatusDot color="gray" /> },
  ]}
/>
```
