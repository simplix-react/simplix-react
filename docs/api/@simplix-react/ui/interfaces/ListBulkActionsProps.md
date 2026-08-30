[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListBulkActionsProps

# Interface: ListBulkActionsProps

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1717](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1717)

Props for the List.BulkActions bar shown when rows are selected.

## Properties

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1725](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1725)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1724](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1724)

***

### clearLabel?

> `optional` **clearLabel**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1723](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1723)

Label for the clear button. Defaults to `"Clear"`.

***

### onClear()?

> `optional` **onClear**: () => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1719](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1719)

#### Returns

`void`

***

### selectedCount

> **selectedCount**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1718](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1718)

***

### selectedLabel()?

> `optional` **selectedLabel**: (`count`) => `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1721](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1721)

Format the selected count label. Defaults to `` `${count} selected` ``.

#### Parameters

##### count

`number`

#### Returns

`string`
