[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / RowActionDef

# Interface: RowActionDef\<T\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:276](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L276)

## Type Parameters

### T

`T`

## Properties

### icon?

> `optional` **icon**: `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:280](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L280)

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:279](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L279)

***

### onClick()

> **onClick**: (`row`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:278](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L278)

#### Parameters

##### row

`T`

#### Returns

`void`

***

### type

> **type**: [`ActionType`](../type-aliases/ActionType.md)

Defined in: [packages/ui/src/crud/list/crud-list.tsx:277](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L277)

***

### when()?

> `optional` **when**: (`row`) => `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:281](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L281)

#### Parameters

##### row

`T`

#### Returns

`boolean`
