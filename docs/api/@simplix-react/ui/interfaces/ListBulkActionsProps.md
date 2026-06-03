[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListBulkActionsProps

# Interface: ListBulkActionsProps

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1340](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1340)

Props for the List.BulkActions bar shown when rows are selected.

## Properties

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1348](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1348)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1347](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1347)

***

### clearLabel?

> `optional` **clearLabel**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1346](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1346)

Label for the clear button. Defaults to `"Clear"`.

***

### onClear()?

> `optional` **onClear**: () => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1342](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1342)

#### Returns

`void`

***

### selectedCount

> **selectedCount**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1341](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1341)

***

### selectedLabel()?

> `optional` **selectedLabel**: (`count`) => `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:1344](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L1344)

Format the selected count label. Defaults to `` `${count} selected` ``.

#### Parameters

##### count

`number`

#### Returns

`string`
