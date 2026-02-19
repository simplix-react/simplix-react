[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListPaginationProps

# Interface: ListPaginationProps

Defined in: packages/ui/src/crud/list/crud-list.tsx:591

Props for the List.Pagination sub-component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: packages/ui/src/crud/list/crud-list.tsx:605

***

### noResultsLabel?

> `optional` **noResultsLabel**: `string`

Defined in: packages/ui/src/crud/list/crud-list.tsx:600

Label shown when total is 0. Defaults to `"No results"`.

***

### onPageChange()

> **onPageChange**: (`page`) => `void`

Defined in: packages/ui/src/crud/list/crud-list.tsx:596

#### Parameters

##### page

`number`

#### Returns

`void`

***

### onPageSizeChange()?

> `optional` **onPageSizeChange**: (`size`) => `void`

Defined in: packages/ui/src/crud/list/crud-list.tsx:597

#### Parameters

##### size

`number`

#### Returns

`void`

***

### page

> **page**: `number`

Defined in: packages/ui/src/crud/list/crud-list.tsx:592

***

### pageSize

> **pageSize**: `number`

Defined in: packages/ui/src/crud/list/crud-list.tsx:593

***

### pageSizeOptions?

> `optional` **pageSizeOptions**: `number`[]

Defined in: packages/ui/src/crud/list/crud-list.tsx:598

***

### rangeLabel()?

> `optional` **rangeLabel**: (`start`, `end`, `total`) => `string`

Defined in: packages/ui/src/crud/list/crud-list.tsx:604

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

Defined in: packages/ui/src/crud/list/crud-list.tsx:602

Label for page-size selector. Defaults to `"Rows:"`.

***

### total

> **total**: `number`

Defined in: packages/ui/src/crud/list/crud-list.tsx:594

***

### totalPages

> **totalPages**: `number`

Defined in: packages/ui/src/crud/list/crud-list.tsx:595
