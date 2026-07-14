[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListBulkActionsProps

# Interface: ListBulkActionsProps

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1439](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1439)

Props for the List.BulkActions bar shown when rows are selected.

## Properties

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1447](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1447)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1446](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1446)

***

### clearLabel?

> `optional` **clearLabel**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1445](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1445)

Label for the clear button. Defaults to `"Clear"`.

***

### onClear()?

> `optional` **onClear**: () => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1441](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1441)

#### Returns

`void`

***

### selectedCount

> **selectedCount**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1440](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1440)

***

### selectedLabel()?

> `optional` **selectedLabel**: (`count`) => `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1443](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1443)

Format the selected count label. Defaults to `` `${count} selected` ``.

#### Parameters

##### count

`number`

#### Returns

`string`
