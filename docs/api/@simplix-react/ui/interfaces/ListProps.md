[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListProps

# Interface: ListProps

Defined in: [packages/ui/src/crud/list/crud-list.tsx:107](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L107)

Props for the [CrudList](../variables/CrudList.md) compound component root.

## Example

```tsx
<CrudList>
  <CrudList.Toolbar>...</CrudList.Toolbar>
  <CrudList.Table data={items}>...</CrudList.Table>
  <CrudList.Pagination ... />
</CrudList>
```

## Properties

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:109](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L109)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:108](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L108)

***

### ref?

> `optional` **ref**: `Ref`\<`HTMLDivElement`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:117](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L117)

The list's own outermost element.

<p>What a screen measures when its column set depends on how much room the list actually has —
which is not how much the window has, because a detail panel takes most of it. Pair with
`useContainerWidth`.
