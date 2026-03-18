[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TreeProps

# Interface: TreeProps

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:111](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L111)

Props for the [CrudTree](../variables/CrudTree.md) compound component root.

```
┌─────────────────────────────────────────┐
│ Toolbar                                 │
│ [Search...]  [Expand All] [Collapse]    │
├────┬─────────────────┬─────────┬────────┤
│    │ Name            │ Status  │ Action │
├────┼─────────────────┼─────────┼────────┤
│ ▼  │ Category A      │ Active  │ [Edit] │
│    │  ├─ Item A-1    │ Active  │ [Edit] │
│    │  └─ Item A-2    │ Draft   │ [Edit] │
│ ▶  │ Category B      │ Active  │ [Edit] │
└────┴─────────────────┴─────────┴────────┘
```

## Properties

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:113](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L113)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:112](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L112)
