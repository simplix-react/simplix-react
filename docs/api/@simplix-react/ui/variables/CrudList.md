[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudList

# Variable: CrudList

> `const` **CrudList**: (`__namedParameters`) => `Element` & `object`

Defined in: packages/ui/src/crud/list/crud-list.tsx:798

Compound component for building CRUD list views with toolbar, table,
pagination, selection, and bulk actions.

Sub-components: Toolbar, Search, Filter, Table, Column, RowActions,
Action, Pagination, BulkActions, BulkAction, Empty.

## Type Declaration

### Action()

> **Action**: \<`T`\>(`__namedParameters`) => `Element` = `ListAction`

#### Type Parameters

##### T

`T`

#### Parameters

##### \_\_namedParameters

[`ListActionProps`](../interfaces/ListActionProps.md)\<`T`\>

#### Returns

`Element`

### BulkAction()

> **BulkAction**: (`__namedParameters`) => `Element` = `ListBulkAction`

#### Parameters

##### \_\_namedParameters

[`ListBulkActionProps`](../interfaces/ListBulkActionProps.md)

#### Returns

`Element`

### BulkActions()

> **BulkActions**: (`__namedParameters`) => `Element` \| `null` = `ListBulkActions`

#### Parameters

##### \_\_namedParameters

[`ListBulkActionsProps`](../interfaces/ListBulkActionsProps.md)

#### Returns

`Element` \| `null`

### Column()

> **Column**: \<`T`\>(`_props`) => `ReactNode` = `ListColumn`

#### Type Parameters

##### T

`T`

#### Parameters

##### \_props

[`ListColumnProps`](../interfaces/ListColumnProps.md)\<`T`\>

#### Returns

`ReactNode`

### Empty()

> **Empty**: (`__namedParameters`) => `Element` = `ListEmpty`

#### Parameters

##### \_\_namedParameters

[`ListEmptyProps`](../interfaces/ListEmptyProps.md)

#### Returns

`Element`

### Filter()

> **Filter**: (`__namedParameters`) => `Element` = `ListFilter`

#### Parameters

##### \_\_namedParameters

[`ListFilterProps`](../interfaces/ListFilterProps.md)

#### Returns

`Element`

### Pagination()

> **Pagination**: (`__namedParameters`) => `Element` = `ListPagination`

#### Parameters

##### \_\_namedParameters

[`ListPaginationProps`](../interfaces/ListPaginationProps.md)

#### Returns

`Element`

### RowActions()

> **RowActions**: (`__namedParameters`) => `Element` = `ListRowActions`

#### Parameters

##### \_\_namedParameters

[`ListRowActionsProps`](../interfaces/ListRowActionsProps.md)

#### Returns

`Element`

### Search()

> **Search**: (`__namedParameters`) => `Element` = `ListSearch`

#### Parameters

##### \_\_namedParameters

[`ListSearchProps`](../interfaces/ListSearchProps.md)

#### Returns

`Element`

### Table()

> **Table**: \<`T`\>(`__namedParameters`) => `Element` = `ListTable`

#### Type Parameters

##### T

`T`

#### Parameters

##### \_\_namedParameters

[`ListTableProps`](../interfaces/ListTableProps.md)\<`T`\>

#### Returns

`Element`

### Toolbar()

> **Toolbar**: (`__namedParameters`) => `Element` = `ListToolbar`

#### Parameters

##### \_\_namedParameters

[`ListToolbarProps`](../interfaces/ListToolbarProps.md)

#### Returns

`Element`
