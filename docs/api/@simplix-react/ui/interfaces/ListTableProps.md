[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListTableProps

# Interface: ListTableProps\<T\>

Defined in: packages/ui/src/crud/list/crud-list.tsx:226

Props for the List.Table sub-component built on TanStack Table.

## Type Parameters

### T

`T`

## Properties

### activeRowId?

> `optional` **activeRowId**: `string` \| `null`

Defined in: packages/ui/src/crud/list/crud-list.tsx:234

Highlights the row whose `rowId` matches this value.

***

### cardBreakpoint?

> `optional` **cardBreakpoint**: `number`

Defined in: packages/ui/src/crud/list/crud-list.tsx:240

Container width threshold (px) below which card mode activates. Disabled when omitted.

***

### cardRender()?

> `optional` **cardRender**: (`props`) => `ReactNode`

Defined in: packages/ui/src/crud/list/crud-list.tsx:242

Render prop for card content. Card interactions (click, selection) are handled by the framework.

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

Defined in: packages/ui/src/crud/list/crud-list.tsx:244

***

### className?

> `optional` **className**: `string`

Defined in: packages/ui/src/crud/list/crud-list.tsx:243

***

### data

> **data**: `T`[]

Defined in: packages/ui/src/crud/list/crud-list.tsx:227

***

### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: packages/ui/src/crud/list/crud-list.tsx:228

***

### onRowClick()?

> `optional` **onRowClick**: (`row`) => `void`

Defined in: packages/ui/src/crud/list/crud-list.tsx:232

#### Parameters

##### row

`T`

#### Returns

`void`

***

### onSelectAll()?

> `optional` **onSelectAll**: () => `void`

Defined in: packages/ui/src/crud/list/crud-list.tsx:237

#### Returns

`void`

***

### onSelectionChange()?

> `optional` **onSelectionChange**: (`index`) => `void`

Defined in: packages/ui/src/crud/list/crud-list.tsx:236

#### Parameters

##### index

`number`

#### Returns

`void`

***

### onSortChange()?

> `optional` **onSortChange**: (`sort`) => `void`

Defined in: packages/ui/src/crud/list/crud-list.tsx:230

#### Parameters

##### sort

[`SortState`](SortState.md)

#### Returns

`void`

***

### rowId()?

> `optional` **rowId**: (`row`) => `string`

Defined in: packages/ui/src/crud/list/crud-list.tsx:238

#### Parameters

##### row

`T`

#### Returns

`string`

***

### selectable?

> `optional` **selectable**: `boolean`

Defined in: packages/ui/src/crud/list/crud-list.tsx:231

***

### selectedIndices?

> `optional` **selectedIndices**: `Set`\<`number`\>

Defined in: packages/ui/src/crud/list/crud-list.tsx:235

***

### sort?

> `optional` **sort**: [`SortState`](SortState.md) \| `null`

Defined in: packages/ui/src/crud/list/crud-list.tsx:229
