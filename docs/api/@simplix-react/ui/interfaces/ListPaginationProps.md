[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListPaginationProps

# Interface: ListPaginationProps

Defined in: [packages/ui/src/crud/list/crud-list.tsx:591](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L591)

Props for the List.Pagination sub-component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:605](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L605)

***

### noResultsLabel?

> `optional` **noResultsLabel**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:600](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L600)

Label shown when total is 0. Defaults to `"No results"`.

***

### onPageChange()

> **onPageChange**: (`page`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:596](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L596)

#### Parameters

##### page

`number`

#### Returns

`void`

***

### onPageSizeChange()?

> `optional` **onPageSizeChange**: (`size`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:597](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L597)

#### Parameters

##### size

`number`

#### Returns

`void`

***

### page

> **page**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:592](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L592)

***

### pageSize

> **pageSize**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:593](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L593)

***

### pageSizeOptions?

> `optional` **pageSizeOptions**: `number`[]

Defined in: [packages/ui/src/crud/list/crud-list.tsx:598](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L598)

***

### rangeLabel()?

> `optional` **rangeLabel**: (`start`, `end`, `total`) => `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:604](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L604)

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

Defined in: [packages/ui/src/crud/list/crud-list.tsx:602](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L602)

Label for page-size selector. Defaults to `"Rows:"`.

***

### total

> **total**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:594](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L594)

***

### totalPages

> **totalPages**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:595](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L595)
