[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListActionProps

# Interface: ListActionProps\<T\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:549](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L549)

Props for individual row action buttons.

## Type Parameters

### T

`T` = `unknown`

## Properties

### action?

> `optional` **action**: `"edit"` \| `"delete"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:550](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L550)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:556](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L556)

***

### icon?

> `optional` **icon**: `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:552](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L552)

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:551](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L551)

***

### onClick()?

> `optional` **onClick**: (`row`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:553](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L553)

#### Parameters

##### row

`T`

#### Returns

`void`

***

### variant?

> `optional` **variant**: `"default"` \| `"destructive"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:555](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L555)

***

### when()?

> `optional` **when**: (`row`) => `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:554](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/crud-list.tsx#L554)

#### Parameters

##### row

`T`

#### Returns

`boolean`
