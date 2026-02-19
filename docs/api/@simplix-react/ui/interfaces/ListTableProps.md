[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListTableProps

# Interface: ListTableProps\<T\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:226](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L226)

Props for the List.Table sub-component built on TanStack Table.

## Type Parameters

### T

`T`

## Properties

### activeRowId?

> `optional` **activeRowId**: `string` \| `null`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:234](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L234)

Highlights the row whose `rowId` matches this value.

***

### cardBreakpoint?

> `optional` **cardBreakpoint**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:240](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L240)

Container width threshold (px) below which card mode activates. Disabled when omitted.

***

### cardRender()?

> `optional` **cardRender**: (`props`) => `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:242](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L242)

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

Defined in: [packages/ui/src/crud/list/crud-list.tsx:244](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L244)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:243](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L243)

***

### data

> **data**: `T`[]

Defined in: [packages/ui/src/crud/list/crud-list.tsx:227](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L227)

***

### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:228](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L228)

***

### onRowClick()?

> `optional` **onRowClick**: (`row`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:232](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L232)

#### Parameters

##### row

`T`

#### Returns

`void`

***

### onSelectAll()?

> `optional` **onSelectAll**: () => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:237](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L237)

#### Returns

`void`

***

### onSelectionChange()?

> `optional` **onSelectionChange**: (`index`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:236](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L236)

#### Parameters

##### index

`number`

#### Returns

`void`

***

### onSortChange()?

> `optional` **onSortChange**: (`sort`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:230](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L230)

#### Parameters

##### sort

[`SortState`](SortState.md)

#### Returns

`void`

***

### rowId()?

> `optional` **rowId**: (`row`) => `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:238](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L238)

#### Parameters

##### row

`T`

#### Returns

`string`

***

### selectable?

> `optional` **selectable**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:231](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L231)

***

### selectedIndices?

> `optional` **selectedIndices**: `Set`\<`number`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:235](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L235)

***

### sort?

> `optional` **sort**: [`SortState`](SortState.md) \| `null`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:229](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L229)
