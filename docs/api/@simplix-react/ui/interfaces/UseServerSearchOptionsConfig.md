[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseServerSearchOptionsConfig

# Interface: UseServerSearchOptionsConfig\<TItem\>

Defined in: [packages/ui/src/crud/list/use-server-search-options.ts:6](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-server-search-options.ts#L6)

Configuration for useServerSearchOptions.

## Type Parameters

### TItem

`TItem`

## Properties

### debounceMs?

> `optional` **debounceMs**: `number`

Defined in: [packages/ui/src/crud/list/use-server-search-options.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-server-search-options.ts#L30)

Debounce delay in milliseconds. Default: 300.

***

### limit?

> `optional` **limit**: `number`

Defined in: [packages/ui/src/crud/list/use-server-search-options.ts:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-server-search-options.ts#L36)

Maximum results per search (maps to page size). Default: 20.

***

### minQueryLength?

> `optional` **minQueryLength**: `number`

Defined in: [packages/ui/src/crud/list/use-server-search-options.ts:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-server-search-options.ts#L33)

Minimum query length to trigger search. Default: 1.

***

### params?

> `optional` **params**: `Record`\<`string`, `string`\>

Defined in: [packages/ui/src/crud/list/use-server-search-options.ts:39](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-server-search-options.ts#L39)

Additional static search params (e.g., fixed filters).

***

### searchField

> **searchField**: `string`

Defined in: [packages/ui/src/crud/list/use-server-search-options.ts:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-server-search-options.ts#L19)

Search field name for the backend query param.
Combined with ".contains" operator: "menuName.contains=query"

#### Example

```ts
"menuName"
```

***

### selectedOption?

> `optional` **selectedOption**: \{ `icon?`: `ReactNode`; `label`: `string`; `value`: `string`; \} \| `null`

Defined in: [packages/ui/src/crud/list/use-server-search-options.ts:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-server-search-options.ts#L27)

Pre-resolved option for the current value (FK label display).
Source: JPA join nested object in parent DTO.
Merged into options array when value not in search results.

#### Example

```ts
{ label: editData.parentMenu?.menuName, value: editData.parentMenuId }
```

***

### toOption()

> **toOption**: (`item`) => `object`

Defined in: [packages/ui/src/crud/list/use-server-search-options.ts:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-server-search-options.ts#L12)

Map each ListDTO item to a combobox option.
Same pattern as useOrvalOptions.toOption.

#### Parameters

##### item

`TItem`

#### Returns

`object`

##### icon?

> `optional` **icon**: `ReactNode`

##### label

> **label**: `string`

##### value

> **value**: `string`

#### Example

```ts
(item) => ({ label: item.menuName, value: item.menuId })
```
