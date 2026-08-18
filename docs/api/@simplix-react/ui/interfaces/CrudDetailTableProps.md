[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetailTableProps

# Interface: CrudDetailTableProps

Defined in: [packages/ui/src/crud/detail/crud-detail-table.tsx:7](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-table.tsx#L7)

Props for the [DetailPagedTable](../variables/CrudDetail.md) sub-component.

## Properties

### children

> **children**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail-table.tsx:9](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-table.tsx#L9)

The table — a `Table` with its own header row and column widths.

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail-table.tsx:34](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-table.tsx#L34)

Additional classes merged onto the card.

***

### onPageChange()?

> `optional` **onPageChange**: (`page`) => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail-table.tsx:32](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-table.tsx#L32)

Called with the page the reader asked for.

#### Parameters

##### page

`number`

#### Returns

`void`

***

### page?

> `optional` **page**: `number`

Defined in: [packages/ui/src/crud/detail/crud-detail-table.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-table.tsx#L19)

The paging, for a table whose rows come a page at a time.

<p><b>Absent means the table has no pages, not that it forgot them.</b> A fixed catalogue —
the four sharing modes, the eleven states a record moves through — has every row it will ever
have, and a pager under it would promise a second page that does not exist. A collection that
grows and arrives without these is the defect, and it is one only a person can see: the
component cannot tell a catalogue of eleven from a history of eleven-so-far.

***

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [packages/ui/src/crud/detail/crud-detail-table.tsx:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-table.tsx#L21)

How many rows a page holds.

***

### total?

> `optional` **total**: `number`

Defined in: [packages/ui/src/crud/detail/crud-detail-table.tsx:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-table.tsx#L23)

How many rows there are in total, across every page.

***

### totalPages?

> `optional` **totalPages**: `number`

Defined in: [packages/ui/src/crud/detail/crud-detail-table.tsx:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-table.tsx#L30)

How many pages that comes to.

<p>Taken rather than derived, for the reason [CrudDetailListProps.totalPages](CrudDetailListProps.md#totalpages) gives: the
server that counted the rows is the one that decided how they divide.
