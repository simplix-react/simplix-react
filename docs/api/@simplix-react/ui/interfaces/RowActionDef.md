[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / RowActionDef

# Interface: RowActionDef\<T\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:264](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L264)

## Type Parameters

### T

`T`

## Properties

### icon?

> `optional` **icon**: `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:268](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L268)

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:267](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L267)

***

### onClick()

> **onClick**: (`row`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:266](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L266)

#### Parameters

##### row

`T`

#### Returns

`void`

***

### type

> **type**: [`ActionType`](../type-aliases/ActionType.md)

Defined in: [packages/ui/src/crud/list/crud-list.tsx:265](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L265)

***

### when()?

> `optional` **when**: (`row`) => `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:269](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L269)

#### Parameters

##### row

`T`

#### Returns

`boolean`
