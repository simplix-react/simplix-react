[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListTableProps

# Interface: ListTableProps\<T\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:339](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L339)

Props for the List.Table sub-component built on TanStack Table.

## Type Parameters

### T

`T`

## Properties

### actionColumnWidth?

> `optional` **actionColumnWidth**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:384](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L384)

Override the auto-calculated action column width (px).

***

### actions?

> `optional` **actions**: [`RowActionDef`](RowActionDef.md)\<`T`\>[]

Defined in: [packages/ui/src/crud/list/crud-list.tsx:380](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L380)

Declarative row action buttons. Automatically appends an action column to the table.

***

### actionVariant?

> `optional` **actionVariant**: [`ActionVariant`](../type-aliases/ActionVariant.md)

Defined in: [packages/ui/src/crud/list/crud-list.tsx:382](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L382)

Visual variant for action buttons. Defaults to `"outline"`.

***

### activeRowId?

> `optional` **activeRowId**: `string` \| `null`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:347](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L347)

Highlights the row whose `rowId` matches this value.

***

### cardBreakpoint?

> `optional` **cardBreakpoint**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:353](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L353)

Container width threshold (px) below which card mode activates. Disabled when omitted.

***

### cardContent()?

> `optional` **cardContent**: (`props`) => `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:363](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L363)

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

Defined in: [packages/ui/src/crud/list/crud-list.tsx:361](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L361)

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

Defined in: [packages/ui/src/crud/list/crud-list.tsx:401](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L401)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:400](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L400)

***

### data

> **data**: `T`[]

Defined in: [packages/ui/src/crud/list/crud-list.tsx:340](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L340)

***

### density?

> `optional` **density**: `"default"` \| `"compact"` \| `"comfortable"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:369](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L369)

Vertical density (padding). Overrides size-based vertical spacing when set.

***

### emptyReason?

> `optional` **emptyReason**: [`EmptyReason`](../type-aliases/EmptyReason.md) \| `null`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:390](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L390)

When set, displays an empty-state message inside the table body.

***

### emptyState?

> `optional` **emptyState**: `object`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:392](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L392)

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

Defined in: [packages/ui/src/crud/list/crud-list.tsx:359](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L359)

Declares grid as a user-selectable view (requires `cardTitle`/`cardContent`).
When set, the FilterBar auto-shows a list/grid toggle. Independent of the
responsive `cardBreakpoint` fallback.

***

### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:341](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L341)

***

### onRowClick()?

> `optional` **onRowClick**: (`row`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:345](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L345)

#### Parameters

##### row

`T`

#### Returns

`void`

***

### onSelectAll()?

> `optional` **onSelectAll**: () => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:350](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L350)

#### Returns

`void`

***

### onSelectionChange()?

> `optional` **onSelectionChange**: (`index`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:349](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L349)

#### Parameters

##### index

`number`

#### Returns

`void`

***

### onSortChange()?

> `optional` **onSortChange**: (`sort`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:343](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L343)

#### Parameters

##### sort

[`SortState`](SortState.md)

#### Returns

`void`

***

### reorder?

> `optional` **reorder**: [`ReorderConfig`](ReorderConfig.md)\<`T`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:388](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L388)

Drag-and-drop row reorder configuration.

***

### rounded?

> `optional` **rounded**: `"none"` \| `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:371](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L371)

Container border radius.

***

### rowClassName()?

> `optional` **rowClassName**: (`row`) => `string` \| `undefined`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:399](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L399)

Callback to compute extra class names for each table/card row.

#### Parameters

##### row

`T`

#### Returns

`string` \| `undefined`

***

### rowId()?

> `optional` **rowId**: (`row`) => `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:351](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L351)

#### Parameters

##### row

`T`

#### Returns

`string`

***

### selectable?

> `optional` **selectable**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:344](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L344)

***

### selectedIndices?

> `optional` **selectedIndices**: `Set`\<`number`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:348](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L348)

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:367](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L367)

Cell padding size.

***

### slots?

> `optional` **slots**: [`ListTableSlots`](ListTableSlots.md)\<`T`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:386](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L386)

Per-instance render overrides for the action cluster and empty state.

***

### sort?

> `optional` **sort**: [`SortState`](SortState.md) \| `null`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:342](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L342)

***

### stickyHeader?

> `optional` **stickyHeader**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:378](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L378)

Sticks the header row to the top of the nearest scrollable ancestor
(e.g. a page, dialog, or detail-pane body) once scrolling would hide it.
The table keeps its own horizontal scrollbar; the floating header scrolls
with its columns. Enabled by default; pass `false` to disable.

***

### variant?

> `optional` **variant**: `"default"` \| `"striped"` \| `"bordered"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:365](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L365)

Table visual variant.
