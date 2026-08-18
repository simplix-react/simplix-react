[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ChipFilter

# Function: ChipFilter()

> **ChipFilter**\<`T`\>(`__namedParameters`): `Element`

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:61](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L61)

Toggle chips that integrate with [CrudListFilters](../interfaces/CrudListFilters.md) for server-side filtering.

Single-select toggle: clicking an active chip deselects it (shows all).

<p>The chips flow from the left at their label's width and wrap onto another line when the row
runs out. They are deliberately NOT stretched to divide the row evenly: an option's width would
then be decided by how many options happen to sit beside it, so the same filter reads as a
segmented control on one screen and as chips on the next, and a two-option filter draws two
half-page buttons. The row still spans the full width — what is left-aligned is the chips
inside it.

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
  state={list.filters}
  options={[
    { value: "active", label: "Active", icon: <StatusDot color="green" /> },
    { value: "inactive", label: "Inactive", icon: <StatusDot color="gray" /> },
  ]}
/>
```
