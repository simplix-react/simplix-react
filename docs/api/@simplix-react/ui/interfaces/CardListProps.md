[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CardListProps

# Interface: CardListProps\<T\>

Defined in: [packages/ui/src/crud/list/card-list.tsx:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/card-list.tsx#L10)

Props for the [CardList](../functions/CardList.md) component.

## Type Parameters

### T

`T`

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/list/card-list.tsx:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/card-list.tsx#L14)

***

### columns?

> `optional` **columns**: `1` \| `2` \| `3`

Defined in: [packages/ui/src/crud/list/card-list.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/card-list.tsx#L13)

***

### data

> **data**: `T`[]

Defined in: [packages/ui/src/crud/list/card-list.tsx:11](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/card-list.tsx#L11)

***

### renderCard()

> **renderCard**: (`item`, `index`) => `ReactNode`

Defined in: [packages/ui/src/crud/list/card-list.tsx:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/card-list.tsx#L12)

#### Parameters

##### item

`T`

##### index

`number`

#### Returns

`ReactNode`
