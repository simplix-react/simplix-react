[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListBulkActionsProps

# Interface: ListBulkActionsProps

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1345](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1345)

Props for the List.BulkActions bar shown when rows are selected.

## Properties

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1353](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1353)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1352](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1352)

***

### clearLabel?

> `optional` **clearLabel**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1351](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1351)

Label for the clear button. Defaults to `"Clear"`.

***

### onClear()?

> `optional` **onClear**: () => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1347](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1347)

#### Returns

`void`

***

### selectedCount

> **selectedCount**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1346](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1346)

***

### selectedLabel()?

> `optional` **selectedLabel**: (`count`) => `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1349](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1349)

Format the selected count label. Defaults to `` `${count} selected` ``.

#### Parameters

##### count

`number`

#### Returns

`string`
