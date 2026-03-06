[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudTree

# Variable: CrudTree

> `const` **CrudTree**: (`__namedParameters`) => `Element` & `object`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:799](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L799)

Compound component for building hierarchical tree views with
expand/collapse, search filtering, sorting, and row actions.

```
┌─────────────────────────────────────────┐
│ <CrudTree.Toolbar>                      │
│   <CrudTree.Search />                   │
│   <CrudTree.ExpandToggle />             │
│ </CrudTree.Toolbar>                     │
│ <CrudTree.Table data={nodes} tree={..}> │
│   <CrudTree.Column field="name" ... />  │
│ </CrudTree.Table>                       │
└─────────────────────────────────────────┘
```

Sub-components: Toolbar, Search, ExpandToggle, HeaderActions,
Table, Column, Empty.

## Type Declaration

### Column()

> **Column**: \<`T`\>(`_props`) => `ReactNode` = `TreeColumn`

#### Type Parameters

##### T

`T`

#### Parameters

##### \_props

[`ListColumnProps`](../interfaces/ListColumnProps.md)\<`T`\>

#### Returns

`ReactNode`

### Empty()

> **Empty**: (`__namedParameters`) => `Element` = `TreeEmpty`

#### Parameters

##### \_\_namedParameters

[`TreeEmptyProps`](../interfaces/TreeEmptyProps.md)

#### Returns

`Element`

### ExpandToggle()

> **ExpandToggle**: (`__namedParameters`) => `Element` \| `null` = `TreeExpandToggle`

#### Parameters

##### \_\_namedParameters

###### className?

`string`

#### Returns

`Element` \| `null`

### HeaderActions()

> **HeaderActions**: (`__namedParameters`) => `Element` = `TreeHeaderActions`

#### Parameters

##### \_\_namedParameters

`TreeHeaderActionsProps`

#### Returns

`Element`

### Search()

> **Search**: (`__namedParameters`) => `Element` = `TreeSearch`

#### Parameters

##### \_\_namedParameters

[`TreeSearchProps`](../interfaces/TreeSearchProps.md)

#### Returns

`Element`

### Table()

> **Table**: \<`T`\>(`__namedParameters`) => `Element` = `TreeTable`

#### Type Parameters

##### T

`T`

#### Parameters

##### \_\_namedParameters

[`TreeTableProps`](../interfaces/TreeTableProps.md)\<`T`\>

#### Returns

`Element`

### Toolbar()

> **Toolbar**: (`__namedParameters`) => `Element` = `TreeToolbar`

#### Parameters

##### \_\_namedParameters

[`TreeToolbarProps`](../interfaces/TreeToolbarProps.md)

#### Returns

`Element`
