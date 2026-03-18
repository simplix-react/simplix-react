[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudList

# Variable: CrudList

> `const` **CrudList**: (`__namedParameters`) => `Element` & `object`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1439](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1439)

Compound component for building CRUD list views with toolbar, table,
pagination, selection, and bulk actions.

```
┌─────────────────────────────────────────┐
│ Toolbar                                 │
│ [Search...]   [Filter ▼]   [+ Create]   │
├─────┬────────┬────────┬────────┬────────┤
│ [x] │ Name   │ Status │ Date   │ Action │
├─────┼────────┼────────┼────────┼────────┤
│ [ ] │ Item A │ Active │ 01-01  │ [Edit] │
│ [x] │ Item B │ Draft  │ 01-02  │ [Edit] │
├─────┴────────┴────────┴────────┴────────┤
│ BulkActions: 1 selected  [Delete]       │
├─────────────────────────────────────────┤
│          Pagination < 1  2  3 >         │
└─────────────────────────────────────────┘
```

Sub-components: Toolbar, Search, Table, Column, Pagination,
BulkActions, BulkAction, Empty, and 10+ filter types.

## Type Declaration

### AdvancedSelectFilter()

> **AdvancedSelectFilter**: (`__namedParameters`) => `Element`

#### Parameters

##### \_\_namedParameters

[`AdvancedSelectFilterProps`](../interfaces/AdvancedSelectFilterProps.md)

#### Returns

`Element`

### AdvancedTextFilter()

> **AdvancedTextFilter**: (`__namedParameters`) => `Element`

#### Parameters

##### \_\_namedParameters

[`AdvancedTextFilterProps`](../interfaces/AdvancedTextFilterProps.md)

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

### ChipFilter()

> **ChipFilter**: \<`T`\>(`__namedParameters`) => `Element`

Toggle chip grid that integrates with [CrudListFilters](../interfaces/CrudListFilters.md) for server-side filtering.

Single-select toggle: clicking an active chip deselects it (shows all).

#### Type Parameters

##### T

`T` *extends* `string` \| `number` = `string`

#### Parameters

##### \_\_namedParameters

[`ChipFilterProps`](../interfaces/ChipFilterProps.md)\<`T`\>

#### Returns

`Element`

#### Example

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

### DateFilter()

> **DateFilter**: (`__namedParameters`) => `Element`

#### Parameters

##### \_\_namedParameters

[`DateFilterProps`](../interfaces/DateFilterProps.md)

#### Returns

`Element`

### DateRangeFilter()

> **DateRangeFilter**: (`props`) => `Element`

Date range filter with dual-month calendar popover.

```
┌──────────────────────────────────────┐
│ [cal] Created | Jan 1 – Jan 31 [X]  │
└──────────────────────────────────────┘
  └─ popover ─────────────────────────┐
  │  [  January  ]  [  February  ]    │
  │  Mo Tu We Th Fr  Mo Tu We Th Fr   │
  │  ...              ...             │
  └──────────────────────────────────┘
```

#### Parameters

##### props

[`DateRangeFilterProps`](../interfaces/DateRangeFilterProps.md)

[DateRangeFilterProps](../interfaces/DateRangeFilterProps.md)

#### Returns

`Element`

### Empty()

> **Empty**: (`__namedParameters`) => `Element` = `ListEmpty`

#### Parameters

##### \_\_namedParameters

[`ListEmptyProps`](../interfaces/ListEmptyProps.md)

#### Returns

`Element`

### FacetedFilter()

> **FacetedFilter**: (`props`) => `Element`

Faceted filter with searchable command popover and badge display.

```
┌─────────────────────────────────┐
│ Status | Active | Draft    [X]  │
└─────────────────────────────────┘
  └─ popover ───────────────────┐
  │ [Search...]                 │
  │ [x] Active                  │
  │ [x] Draft                   │
  │ [ ] Archived                │
  │ ─────────────               │
  │ Clear filters               │
  └────────────────────────────┘
```

#### Parameters

##### props

[`FacetedFilterProps`](../interfaces/FacetedFilterProps.md)

[FacetedFilterProps](../interfaces/FacetedFilterProps.md)

#### Returns

`Element`

### FilterActions()

> **FilterActions**: (`__namedParameters`) => `Element`

#### Parameters

##### \_\_namedParameters

[`FilterActionsProps`](../interfaces/FilterActionsProps.md)

#### Returns

`Element`

### FilterBar()

> **FilterBar**: (`__namedParameters`) => `Element`

#### Parameters

##### \_\_namedParameters

[`FilterBarProps`](../interfaces/FilterBarProps.md)

#### Returns

`Element`

### MultiTextFilter()

> **MultiTextFilter**: (`__namedParameters`) => `Element`

#### Parameters

##### \_\_namedParameters

[`MultiTextFilterProps`](../interfaces/MultiTextFilterProps.md)

#### Returns

`Element`

### NumberFilter()

> **NumberFilter**: (`__namedParameters`) => `Element`

#### Parameters

##### \_\_namedParameters

[`NumberFilterProps`](../interfaces/NumberFilterProps.md)

#### Returns

`Element`

### Pagination()

> **Pagination**: (`__namedParameters`) => `Element` = `ListPagination`

#### Parameters

##### \_\_namedParameters

[`ListPaginationProps`](../interfaces/ListPaginationProps.md)

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

### TextFilter()

> **TextFilter**: (`props`) => `Element`

Text input filter with search icon and clear button.

```
┌──────────────────────────┐
│ [Q] Search pets...   [X] │
└──────────────────────────┘
```

#### Parameters

##### props

[`TextFilterProps`](../interfaces/TextFilterProps.md)

[TextFilterProps](../interfaces/TextFilterProps.md)

#### Returns

`Element`

### ToggleFilter()

> **ToggleFilter**: (`__namedParameters`) => `Element`

#### Parameters

##### \_\_namedParameters

[`ToggleFilterProps`](../interfaces/ToggleFilterProps.md)

#### Returns

`Element`

### Toolbar()

> **Toolbar**: (`__namedParameters`) => `Element` = `ListToolbar`

#### Parameters

##### \_\_namedParameters

[`ListToolbarProps`](../interfaces/ListToolbarProps.md)

#### Returns

`Element`

### UnifiedTextFilter()

> **UnifiedTextFilter**: (`__namedParameters`) => `Element`

#### Parameters

##### \_\_namedParameters

[`UnifiedTextFilterProps`](../interfaces/UnifiedTextFilterProps.md)

#### Returns

`Element`
