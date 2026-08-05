[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListTableProps

# Interface: ListTableProps\<T\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:374](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L374)

Props for the List.Table sub-component built on TanStack Table.

## Type Parameters

### T

`T`

## Properties

### actionColumnWidth?

> `optional` **actionColumnWidth**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:419](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L419)

Override the auto-calculated action column width (px).

***

### actions?

> `optional` **actions**: [`RowActionDef`](RowActionDef.md)\<`T`\>[]

Defined in: [packages/ui/src/crud/list/crud-list.tsx:415](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L415)

Declarative row action buttons. Automatically appends an action column to the table.

***

### actionVariant?

> `optional` **actionVariant**: [`ActionVariant`](../type-aliases/ActionVariant.md)

Defined in: [packages/ui/src/crud/list/crud-list.tsx:417](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L417)

Visual variant for action buttons. Defaults to `"outline"`.

***

### activeRowId?

> `optional` **activeRowId**: `string` \| `null`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:382](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L382)

Highlights the row whose `rowId` matches this value.

***

### cardBreakpoint?

> `optional` **cardBreakpoint**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:388](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L388)

Container width threshold (px) below which card mode activates. Disabled when omitted.

***

### cardContent()?

> `optional` **cardContent**: (`props`) => `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:398](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L398)

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

Defined in: [packages/ui/src/crud/list/crud-list.tsx:396](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L396)

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

Defined in: [packages/ui/src/crud/list/crud-list.tsx:436](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L436)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:435](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L435)

***

### data

> **data**: `T`[]

Defined in: [packages/ui/src/crud/list/crud-list.tsx:375](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L375)

***

### density?

> `optional` **density**: `"default"` \| `"compact"` \| `"comfortable"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:404](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L404)

Vertical density (padding). Overrides size-based vertical spacing when set.

***

### emptyReason?

> `optional` **emptyReason**: [`EmptyReason`](../type-aliases/EmptyReason.md) \| `null`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:425](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L425)

When set, displays an empty-state message inside the table body.

***

### emptyState?

> `optional` **emptyState**: `object`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:427](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L427)

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

Defined in: [packages/ui/src/crud/list/crud-list.tsx:394](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L394)

Declares grid as a user-selectable view (requires `cardTitle`/`cardContent`).
When set, the FilterBar auto-shows a list/grid toggle. Independent of the
responsive `cardBreakpoint` fallback.

***

### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:376](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L376)

***

### onRowClick()?

> `optional` **onRowClick**: (`row`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:380](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L380)

#### Parameters

##### row

`T`

#### Returns

`void`

***

### onSelectAll()?

> `optional` **onSelectAll**: () => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:385](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L385)

#### Returns

`void`

***

### onSelectionChange()?

> `optional` **onSelectionChange**: (`index`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:384](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L384)

#### Parameters

##### index

`number`

#### Returns

`void`

***

### onSortChange()?

> `optional` **onSortChange**: (`sort`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:378](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L378)

#### Parameters

##### sort

[`SortState`](SortState.md)

#### Returns

`void`

***

### reorder?

> `optional` **reorder**: [`ReorderConfig`](ReorderConfig.md)\<`T`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:423](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L423)

Drag-and-drop row reorder configuration.

***

### rounded?

> `optional` **rounded**: `"none"` \| `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:406](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L406)

Container border radius.

***

### rowClassName()?

> `optional` **rowClassName**: (`row`) => `string` \| `undefined`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:434](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L434)

Callback to compute extra class names for each table/card row.

#### Parameters

##### row

`T`

#### Returns

`string` \| `undefined`

***

### rowId()?

> `optional` **rowId**: (`row`) => `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:386](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L386)

#### Parameters

##### row

`T`

#### Returns

`string`

***

### selectable?

> `optional` **selectable**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:379](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L379)

***

### selectedIndices?

> `optional` **selectedIndices**: `Set`\<`number`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:383](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L383)

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:402](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L402)

Cell padding size.

***

### slots?

> `optional` **slots**: [`ListTableSlots`](ListTableSlots.md)\<`T`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:421](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L421)

Per-instance render overrides for the action cluster and empty state.

***

### sort?

> `optional` **sort**: [`SortState`](SortState.md) \| `null`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:377](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L377)

***

### stickyHeader?

> `optional` **stickyHeader**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:413](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L413)

Sticks the header row to the top of the nearest scrollable ancestor
(e.g. a page, dialog, or detail-pane body) once scrolling would hide it.
The table keeps its own horizontal scrollbar; the floating header scrolls
with its columns. Enabled by default; pass `false` to disable.

***

### variant?

> `optional` **variant**: `"default"` \| `"striped"` \| `"bordered"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:400](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L400)

Table visual variant.
