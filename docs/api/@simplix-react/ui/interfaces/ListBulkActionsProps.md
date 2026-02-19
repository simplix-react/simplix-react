[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListBulkActionsProps

# Interface: ListBulkActionsProps

Defined in: packages/ui/src/crud/list/crud-list.tsx:685

Props for the List.BulkActions bar shown when rows are selected.

## Properties

### children?

> `optional` **children**: `ReactNode`

Defined in: packages/ui/src/crud/list/crud-list.tsx:693

***

### className?

> `optional` **className**: `string`

Defined in: packages/ui/src/crud/list/crud-list.tsx:692

***

### clearLabel?

> `optional` **clearLabel**: `string`

Defined in: packages/ui/src/crud/list/crud-list.tsx:691

Label for the clear button. Defaults to `"Clear"`.

***

### onClear()?

> `optional` **onClear**: () => `void`

Defined in: packages/ui/src/crud/list/crud-list.tsx:687

#### Returns

`void`

***

### selectedCount

> **selectedCount**: `number`

Defined in: packages/ui/src/crud/list/crud-list.tsx:686

***

### selectedLabel()?

> `optional` **selectedLabel**: (`count`) => `string`

Defined in: packages/ui/src/crud/list/crud-list.tsx:689

Format the selected count label. Defaults to `` `${count} selected` ``.

#### Parameters

##### count

`number`

#### Returns

`string`
