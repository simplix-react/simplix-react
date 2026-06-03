[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListTableProps

# Interface: ListTableProps\<T\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:267](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L267)

Props for the List.Table sub-component built on TanStack Table.

## Type Parameters

### T

`T`

## Properties

### actionColumnWidth?

> `optional` **actionColumnWidth**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:305](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L305)

Override the auto-calculated action column width (px).

***

### actions?

> `optional` **actions**: [`RowActionDef`](RowActionDef.md)\<`T`\>[]

Defined in: [packages/ui/src/crud/list/crud-list.tsx:301](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L301)

Declarative row action buttons. Automatically appends an action column to the table.

***

### actionVariant?

> `optional` **actionVariant**: [`ActionVariant`](../type-aliases/ActionVariant.md)

Defined in: [packages/ui/src/crud/list/crud-list.tsx:303](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L303)

Visual variant for action buttons. Defaults to `"outline"`.

***

### activeRowId?

> `optional` **activeRowId**: `string` \| `null`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:275](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L275)

Highlights the row whose `rowId` matches this value.

***

### cardBreakpoint?

> `optional` **cardBreakpoint**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:281](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L281)

Container width threshold (px) below which card mode activates. Disabled when omitted.

***

### cardContent()?

> `optional` **cardContent**: (`props`) => `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:291](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L291)

Render prop for the card content area below the title.

#### Parameters

##### props

###### index

`number`

###### row

`T`

#### Returns

`ReactNode`

***

### cardTitle()?

> `optional` **cardTitle**: (`props`) => `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:289](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L289)

Render prop for the card title area. Displayed with a bottom border, inline with action buttons.

#### Parameters

##### props

###### index

`number`

###### row

`T`

#### Returns

`ReactNode`

***

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:320](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L320)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:319](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L319)

***

### data

> **data**: `T`[]

Defined in: [packages/ui/src/crud/list/crud-list.tsx:268](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L268)

***

### density?

> `optional` **density**: `"default"` \| `"compact"` \| `"comfortable"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:297](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L297)

Vertical density (padding). Overrides size-based vertical spacing when set.

***

### emptyReason?

> `optional` **emptyReason**: [`EmptyReason`](../type-aliases/EmptyReason.md) \| `null`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:309](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L309)

When set, displays an empty-state message inside the table body.

***

### emptyState?

> `optional` **emptyState**: `object`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:311](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L311)

Rich empty state config for "no-data" reason. Replaces the entire table with a centered illustration.

#### action?

> `optional` **action**: `ReactNode`

#### description?

> `optional` **description**: `string`

#### icon?

> `optional` **icon**: `ReactNode`

#### title

> **title**: `string`

***

### gridView?

> `optional` **gridView**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:287](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L287)

Declares grid as a user-selectable view (requires `cardTitle`/`cardContent`).
When set, the FilterBar auto-shows a list/grid toggle. Independent of the
responsive `cardBreakpoint` fallback.

***

### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:269](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L269)

***

### onRowClick()?

> `optional` **onRowClick**: (`row`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:273](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L273)

#### Parameters

##### row

`T`

#### Returns

`void`

***

### onSelectAll()?

> `optional` **onSelectAll**: () => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:278](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L278)

#### Returns

`void`

***

### onSelectionChange()?

> `optional` **onSelectionChange**: (`index`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:277](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L277)

#### Parameters

##### index

`number`

#### Returns

`void`

***

### onSortChange()?

> `optional` **onSortChange**: (`sort`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:271](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L271)

#### Parameters

##### sort

[`SortState`](SortState.md)

#### Returns

`void`

***

### reorder?

> `optional` **reorder**: [`ReorderConfig`](ReorderConfig.md)\<`T`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:307](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L307)

Drag-and-drop row reorder configuration.

***

### rounded?

> `optional` **rounded**: `"none"` \| `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:299](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L299)

Container border radius.

***

### rowClassName()?

> `optional` **rowClassName**: (`row`) => `string` \| `undefined`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:318](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L318)

Callback to compute extra class names for each table/card row.

#### Parameters

##### row

`T`

#### Returns

`string` \| `undefined`

***

### rowId()?

> `optional` **rowId**: (`row`) => `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:279](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L279)

#### Parameters

##### row

`T`

#### Returns

`string`

***

### selectable?

> `optional` **selectable**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:272](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L272)

***

### selectedIndices?

> `optional` **selectedIndices**: `Set`\<`number`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:276](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L276)

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:295](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L295)

Cell padding size.

***

### sort?

> `optional` **sort**: [`SortState`](SortState.md) \| `null`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:270](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L270)

***

### variant?

> `optional` **variant**: `"default"` \| `"striped"` \| `"bordered"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:293](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L293)

Table visual variant.
