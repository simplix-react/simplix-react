[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListBulkActionsProps

# Interface: ListBulkActionsProps

Defined in: [packages/ui/src/crud/list/crud-list.tsx:685](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L685)

Props for the List.BulkActions bar shown when rows are selected.

## Properties

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:693](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L693)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:692](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L692)

***

### clearLabel?

> `optional` **clearLabel**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:691](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L691)

Label for the clear button. Defaults to `"Clear"`.

***

### onClear()?

> `optional` **onClear**: () => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:687](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L687)

#### Returns

`void`

***

### selectedCount

> **selectedCount**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:686](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L686)

***

### selectedLabel()?

> `optional` **selectedLabel**: (`count`) => `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:689](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L689)

Format the selected count label. Defaults to `` `${count} selected` ``.

#### Parameters

##### count

`number`

#### Returns

`string`
