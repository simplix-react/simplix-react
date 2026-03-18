[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / SearchPopover

# Function: SearchPopover()

> **SearchPopover**\<`T`\>(`__namedParameters`): `Element`

Defined in: [packages/ui/src/base/inputs/search-popover.tsx:95](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/search-popover.tsx#L95)

Searchable popover for selecting items from a flat or grouped list.
Uses a unified trigger button design with PlusIcon.

## Type Parameters

### T

`T`

## Parameters

### \_\_namedParameters

[`SearchPopoverProps`](../interfaces/SearchPopoverProps.md)\<`T`\>

## Returns

`Element`

## Example

```tsx
// Flat list
<SearchPopover
  triggerText="Assign Level"
  items={availableLevels}
  getLabel={(l) => l.name}
  getKey={(l) => l.id}
  onSelect={(l) => handleAssign(l.id)}
/>

// Grouped list
<SearchPopover
  triggerText="Assign Door"
  groups={[
    { label: "Controller A", items: doorsA },
    { label: "Controller B", items: doorsB },
  ]}
  getLabel={(d) => d.name}
  getKey={(d) => d.id}
  onSelect={(d) => handleAdd(d.id)}
/>
```
