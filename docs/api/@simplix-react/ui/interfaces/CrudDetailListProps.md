[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetailListProps

# Interface: CrudDetailListProps

Defined in: [packages/ui/src/crud/detail/crud-detail-list.tsx:7](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-list.tsx#L7)

Props for the [DetailPagedList](../variables/CrudDetail.md) sub-component.

## Properties

### children

> **children**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail-list.tsx:9](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-list.tsx#L9)

`DetailListRow` elements for the page currently shown.

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail-list.tsx:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-list.tsx#L27)

Additional classes merged onto the container root.

***

### onPageChange()

> **onPageChange**: (`page`) => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail-list.tsx:25](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-list.tsx#L25)

Called with the page the reader asked for.

#### Parameters

##### page

`number`

#### Returns

`void`

***

### page

> **page**: `number`

Defined in: [packages/ui/src/crud/detail/crud-detail-list.tsx:11](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-list.tsx#L11)

The page being shown, 1-based.

***

### pageSize

> **pageSize**: `number`

Defined in: [packages/ui/src/crud/detail/crud-detail-list.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-list.tsx#L13)

How many rows a page holds.

***

### total

> **total**: `number`

Defined in: [packages/ui/src/crud/detail/crud-detail-list.tsx:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-list.tsx#L15)

How many rows there are in total, across every page.

***

### totalPages

> **totalPages**: `number`

Defined in: [packages/ui/src/crud/detail/crud-detail-list.tsx:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-list.tsx#L23)

How many pages that comes to.

<p>Taken rather than derived, because the server that counted the rows is the one that
decided how they divide — a client dividing `total` by `pageSize` disagrees with it the
moment the endpoint caps a page or filters after counting.
