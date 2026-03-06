[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CardList

# Function: CardList()

> **CardList**\<`T`\>(`props`): `Element`

Defined in: [packages/ui/src/crud/list/card-list.tsx:40](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/card-list.tsx#L40)

Mobile-friendly card-based list layout alternative to the table view.

```
columns={2}
┌───────────────┬───────────────┐
│   Card A      │   Card B      │
├───────────────┼───────────────┤
│   Card C      │   Card D      │
└───────────────┴───────────────┘
```

## Type Parameters

### T

`T`

Row data type.

## Parameters

### props

[`CardListProps`](../interfaces/CardListProps.md)\<`T`\>

[CardListProps](../interfaces/CardListProps.md)

## Returns

`Element`

## Example

```tsx
<CardList data={items} columns={2} renderCard={(item) => <MyCard item={item} />} />
```
