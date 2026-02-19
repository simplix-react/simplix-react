[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListPaginationProps

# Interface: ListPaginationProps

Defined in: [packages/ui/src/crud/list/crud-list.tsx:608](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L608)

Props for the List.Pagination sub-component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:622](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L622)

***

### noResultsLabel?

> `optional` **noResultsLabel**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:617](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L617)

Label shown when total is 0. Defaults to `"No results"`.

***

### onPageChange()

> **onPageChange**: (`page`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:613](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L613)

#### Parameters

##### page

`number`

#### Returns

`void`

***

### onPageSizeChange()?

> `optional` **onPageSizeChange**: (`size`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:614](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L614)

#### Parameters

##### size

`number`

#### Returns

`void`

***

### page

> **page**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:609](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L609)

***

### pageSize

> **pageSize**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:610](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L610)

***

### pageSizeOptions?

> `optional` **pageSizeOptions**: `number`[]

Defined in: [packages/ui/src/crud/list/crud-list.tsx:615](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L615)

***

### rangeLabel()?

> `optional` **rangeLabel**: (`start`, `end`, `total`) => `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:621](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L621)

Format the range text. Defaults to `` `${start}-${end} of ${total}` ``.

#### Parameters

##### start

`number`

##### end

`number`

##### total

`number`

#### Returns

`string`

***

### rowsLabel?

> `optional` **rowsLabel**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:619](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L619)

Label for page-size selector. Defaults to `"Rows:"`.

***

### total

> **total**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:611](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L611)

***

### totalPages

> **totalPages**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:612](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L612)
