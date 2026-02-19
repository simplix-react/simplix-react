[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CardList

# Function: CardList()

> **CardList**\<`T`\>(`__namedParameters`): `Element`

Defined in: [packages/ui/src/crud/list/card-list.tsx:25](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/list/card-list.tsx#L25)

Mobile-friendly card-based list layout alternative to the table view.

## Type Parameters

### T

`T`

## Parameters

### \_\_namedParameters

[`CardListProps`](../interfaces/CardListProps.md)\<`T`\>

## Returns

`Element`

## Example

```tsx
<CardList data={items} columns={2} renderCard={(item) => <MyCard item={item} />} />
```
