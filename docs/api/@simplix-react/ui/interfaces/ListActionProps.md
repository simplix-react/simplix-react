[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListActionProps

# Interface: ListActionProps\<T\>

Defined in: packages/ui/src/crud/list/crud-list.tsx:549

Props for individual row action buttons.

## Type Parameters

### T

`T` = `unknown`

## Properties

### action?

> `optional` **action**: `"edit"` \| `"delete"`

Defined in: packages/ui/src/crud/list/crud-list.tsx:550

***

### className?

> `optional` **className**: `string`

Defined in: packages/ui/src/crud/list/crud-list.tsx:556

***

### icon?

> `optional` **icon**: `ReactNode`

Defined in: packages/ui/src/crud/list/crud-list.tsx:552

***

### label?

> `optional` **label**: `string`

Defined in: packages/ui/src/crud/list/crud-list.tsx:551

***

### onClick()?

> `optional` **onClick**: (`row`) => `void`

Defined in: packages/ui/src/crud/list/crud-list.tsx:553

#### Parameters

##### row

`T`

#### Returns

`void`

***

### variant?

> `optional` **variant**: `"default"` \| `"destructive"`

Defined in: packages/ui/src/crud/list/crud-list.tsx:555

***

### when()?

> `optional` **when**: (`row`) => `boolean`

Defined in: packages/ui/src/crud/list/crud-list.tsx:554

#### Parameters

##### row

`T`

#### Returns

`boolean`
