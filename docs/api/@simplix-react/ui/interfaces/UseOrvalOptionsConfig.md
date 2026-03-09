[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseOrvalOptionsConfig

# Interface: UseOrvalOptionsConfig\<TItem\>

Defined in: [packages/ui/src/crud/list/use-orval-options.ts:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-orval-options.ts#L14)

Configuration for [useOrvalOptions](../functions/useOrvalOptions.md).

## Type Parameters

### TItem

`TItem`

## Properties

### params?

> `optional` **params**: `Record`\<`string`, `unknown`\>

Defined in: [packages/ui/src/crud/list/use-orval-options.ts:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-orval-options.ts#L18)

Query params forwarded to the Orval hook (default: `{ page: 0, size: 100 }`).

***

### toOption()

> **toOption**: (`item`) => `object`

Defined in: [packages/ui/src/crud/list/use-orval-options.ts:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-orval-options.ts#L16)

Map each item to a combobox option.

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
