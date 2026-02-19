[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListTableProps

# Interface: ListTableProps\<T\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:235](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L235)

Props for the List.Table sub-component built on TanStack Table.

## Type Parameters

### T

`T`

## Properties

### activeRowId?

> `optional` **activeRowId**: `string` \| `null`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:243](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L243)

Highlights the row whose `rowId` matches this value.

***

### cardBreakpoint?

> `optional` **cardBreakpoint**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:249](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L249)

Container width threshold (px) below which card mode activates. Disabled when omitted.

***

### cardRender()?

> `optional` **cardRender**: (`props`) => `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:251](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L251)

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

Defined in: [packages/ui/src/crud/list/crud-list.tsx:259](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L259)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:258](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L258)

***

### data

> **data**: `T`[]

Defined in: [packages/ui/src/crud/list/crud-list.tsx:236](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L236)

***

### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:237](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L237)

***

### onRowClick()?

> `optional` **onRowClick**: (`row`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:241](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L241)

#### Parameters

##### row

`T`

#### Returns

`void`

***

### onSelectAll()?

> `optional` **onSelectAll**: () => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:246](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L246)

#### Returns

`void`

***

### onSelectionChange()?

> `optional` **onSelectionChange**: (`index`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:245](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L245)

#### Parameters

##### index

`number`

#### Returns

`void`

***

### onSortChange()?

> `optional` **onSortChange**: (`sort`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:239](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L239)

#### Parameters

##### sort

[`SortState`](SortState.md)

#### Returns

`void`

***

### rounded?

> `optional` **rounded**: `"lg"` \| `"md"` \| `"sm"` \| `"none"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:257](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L257)

Container border radius.

***

### rowId()?

> `optional` **rowId**: (`row`) => `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:247](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L247)

#### Parameters

##### row

`T`

#### Returns

`string`

***

### selectable?

> `optional` **selectable**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:240](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L240)

***

### selectedIndices?

> `optional` **selectedIndices**: `Set`\<`number`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:244](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L244)

***

### size?

> `optional` **size**: `"lg"` \| `"md"` \| `"sm"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:255](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L255)

Cell padding size.

***

### sort?

> `optional` **sort**: [`SortState`](SortState.md) \| `null`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:238](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L238)

***

### variant?

> `optional` **variant**: `"default"` \| `"striped"` \| `"bordered"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:253](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L253)

Table visual variant.
