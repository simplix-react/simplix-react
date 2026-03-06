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

Defined in: [packages/ui/src/crud/list/card-list.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/card-list.tsx#L17)

***

### columns?

> `optional` **columns**: `1` \| `2` \| `3`

Defined in: [packages/ui/src/crud/list/card-list.tsx:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/card-list.tsx#L16)

Number of grid columns. Defaults to `1`.

***

### data

> **data**: `T`[]

Defined in: [packages/ui/src/crud/list/card-list.tsx:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/card-list.tsx#L12)

Array of items to render as cards.

***

### renderCard()

> **renderCard**: (`item`, `index`) => `ReactNode`

Defined in: [packages/ui/src/crud/list/card-list.tsx:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/card-list.tsx#L14)

Render function for each card.

#### Parameters

##### item

`T`

##### index

`number`

#### Returns

`ReactNode`
