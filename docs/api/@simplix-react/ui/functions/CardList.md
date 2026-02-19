[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CardList

# Function: CardList()

> **CardList**\<`T`\>(`__namedParameters`): `Element`

Defined in: [packages/ui/src/crud/list/card-list.tsx:25](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/card-list.tsx#L25)

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
