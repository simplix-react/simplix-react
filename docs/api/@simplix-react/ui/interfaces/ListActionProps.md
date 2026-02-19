[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListActionProps

# Interface: ListActionProps\<T\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:566](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L566)

Props for individual row action buttons.

## Type Parameters

### T

`T` = `unknown`

## Properties

### action?

> `optional` **action**: `"edit"` \| `"delete"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:567](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L567)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:573](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L573)

***

### icon?

> `optional` **icon**: `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:569](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L569)

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:568](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L568)

***

### onClick()?

> `optional` **onClick**: (`row`) => `void`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:570](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L570)

#### Parameters

##### row

`T`

#### Returns

`void`

***

### variant?

> `optional` **variant**: `"default"` \| `"destructive"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:572](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L572)

***

### when()?

> `optional` **when**: (`row`) => `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:571](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L571)

#### Parameters

##### row

`T`

#### Returns

`boolean`
