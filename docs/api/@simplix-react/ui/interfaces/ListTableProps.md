[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListTableProps

# Interface: ListTableProps\<T\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:371](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L371)

Props for the List.Table sub-component built on TanStack Table.

## Type Parameters

### T

`T`

## Properties

### actionColumnWidth?

> `optional` **actionColumnWidth**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:416](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L416)

Override the auto-calculated action column width (px).

***

### actions?

> `optional` **actions**: [`RowActionDef`](RowActionDef.md)\<`T`\>[]

Defined in: [packages/ui/src/crud/list/crud-list.tsx:412](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L412)

Declarative row action buttons. Automatically appends an action column to the table.

***

### actionVariant?

> `optional` **actionVariant**: [`ActionVariant`](../type-aliases/ActionVariant.md)

Defined in: [packages/ui/src/crud/list/crud-list.tsx:414](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L414)

Visual variant for action buttons. Defaults to `"outline"`.

***

### activeRowId?

> `optional` **activeRowId**: `string` \| `null`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:379](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L379)

Highlights the row whose `rowId` matches this value.

***

### cardBreakpoint?

> `optional` **cardBreakpoint**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:385](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L385)

Container width threshold (px) below which card mode activates. Disabled when omitted.

***

### cardContent()?

> `optional` **cardContent**: (`props`) => `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:395](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L395)

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

Defined in: [packages/ui/src/crud/list/crud-list.tsx:393](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L393)

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

Defined in: [packages/ui/src/crud/list/crud-list.tsx:462](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L462)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:461](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L461)

***

### data

> **data**: `T`[]

Defined in: [packages/ui/src/crud/list/crud-list.tsx:372](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L372)

***

### density?

> `optional` **density**: `"default"` \| `"compact"` \| `"comfortable"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:401](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L401)

Vertical density (padding). Overrides size-based vertical spacing when set.

***

### emptyReason?

> `optional` **emptyReason**: [`EmptyReason`](../type-aliases/EmptyReason.md) \| `null`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:434](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L434)

When set, displays an empty-state message inside the table body.

***

### emptyState?

> `optional` **emptyState**: `object`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:436](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L436)

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

Defined in: [packages/ui/src/crud/list/crud-list.tsx:391](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L391)

Declares grid as a user-selectable view (requires `cardTitle`/`cardContent`).
When set, the FilterBar auto-shows a list/grid toggle. Independent of the
responsive `cardBreakpoint` fallback.

***

### groupBy?

> `optional` **groupBy**: `ListGroupConfig`\<`T`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:460](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L460)

Puts the rows under headings, one heading per distinct key.

A catalogue people navigate by band rather than by row — ranks under 임원 / 관리 / 현장,
organizations under principal / contractor — reads as a flat list without this, and the
reader scans every row to find where one band ends.

Rows are bucketed, so a group is contiguous whatever the sort: `sort` then orders the rows
*within* a group and `order` (or first appearance) orders the groups themselves. Without
bucketing a catalogue sorted by rank would print the same heading twice the moment one
member of a band sorted away from the rest, which is the usual case rather than the odd one.

Grouping is a property of the page in front of the reader: it applies to the rows this page
holds, and says nothing about the ones on the next. It does not apply in card mode, where
the rows are no longer a table.

***

### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:373](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L373)

***

### onRowClick()?

> `optional` **onRowClick**: (`row`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:377](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L377)

#### Parameters

##### row

`T`

#### Returns

`void`

***

### onSelectAll()?

> `optional` **onSelectAll**: () => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:382](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L382)

#### Returns

`void`

***

### onSelectionChange()?

> `optional` **onSelectionChange**: (`index`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:381](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L381)

#### Parameters

##### index

`number`

#### Returns

`void`

***

### onSortChange()?

> `optional` **onSortChange**: (`sort`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:375](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L375)

#### Parameters

##### sort

[`SortState`](SortState.md)

#### Returns

`void`

***

### reorder?

> `optional` **reorder**: [`ReorderConfig`](ReorderConfig.md)\<`T`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:432](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L432)

Drag-and-drop row reorder configuration.

***

### resizableColumns?

> `optional` **resizableColumns**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:428](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L428)

Lets the reader drag a column's trailing edge, keeping the width under this key.

<p>Omit and the columns stay exactly as the screen declared them. Supply a key — one per list
screen — and every column carrying a `field` grows a grab zone whose width outlives the visit.
Two renderings of the same list share a key on purpose: they are the same columns, and a
reader who widened one meant the column rather than the placement.

<p>Widths are stored by the column's `field`, so inserting a column does not move a stored
width onto its neighbour and translating the header does not lose it.

***

### rounded?

> `optional` **rounded**: `"none"` \| `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:403](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L403)

Container border radius.

***

### rowClassName()?

> `optional` **rowClassName**: (`row`) => `string` \| `undefined`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:443](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L443)

Callback to compute extra class names for each table/card row.

#### Parameters

##### row

`T`

#### Returns

`string` \| `undefined`

***

### rowId()?

> `optional` **rowId**: (`row`) => `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:383](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L383)

#### Parameters

##### row

`T`

#### Returns

`string`

***

### selectable?

> `optional` **selectable**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:376](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L376)

***

### selectedIndices?

> `optional` **selectedIndices**: `Set`\<`number`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:380](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L380)

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:399](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L399)

Cell padding size.

***

### slots?

> `optional` **slots**: [`ListTableSlots`](ListTableSlots.md)\<`T`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:430](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L430)

Per-instance render overrides for the action cluster and empty state.

***

### sort?

> `optional` **sort**: [`SortState`](SortState.md) \| `null`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:374](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L374)

***

### stickyHeader?

> `optional` **stickyHeader**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:410](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L410)

Sticks the header row to the top of the nearest scrollable ancestor
(e.g. a page, dialog, or detail-pane body) once scrolling would hide it.
The table keeps its own horizontal scrollbar; the floating header scrolls
with its columns. Enabled by default; pass `false` to disable.

***

### variant?

> `optional` **variant**: `"default"` \| `"striped"` \| `"bordered"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:397](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L397)

Table visual variant.
