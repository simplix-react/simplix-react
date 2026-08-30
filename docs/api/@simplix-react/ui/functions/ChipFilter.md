[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ChipFilter

# Function: ChipFilter()

> **ChipFilter**\<`T`\>(`__namedParameters`): `Element`

Defined in: [packages/ui/src/crud/filters/chip-filter.tsx:103](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/chip-filter.tsx#L103)

Toggle chips that integrate with [CrudListFilters](../interfaces/CrudListFilters.md) for server-side filtering.

<p><b>Several at once.</b> A chip narrows the set rather than choosing from it, so pressing a
second chip widens the narrowing instead of replacing it, and pressing a lit chip drops that
value. With every chip off the field carries nothing and the set is unnarrowed. A row where
only one chip can be lit is a tab strip wearing pills — the reader cannot tell the two apart,
and the one that answers to a press differently from how it looks is the one that misleads.

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
  field="status.in"
  state={list.filters}
  options={[
    { value: "active", label: "Active", icon: <StatusDot color="green" /> },
    { value: "inactive", label: "Inactive", icon: <StatusDot color="gray" /> },
  ]}
/>
```
