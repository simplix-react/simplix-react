[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseServerSearchOptionsReturn

# Interface: UseServerSearchOptionsReturn

Defined in: [packages/ui/src/crud/list/use-server-search-options.ts:43](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-server-search-options.ts#L43)

Return type of useServerSearchOptions — ready to spread into ComboboxField.

## Properties

### isLoading

> **isLoading**: `boolean`

Defined in: [packages/ui/src/crud/list/use-server-search-options.ts:47](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-server-search-options.ts#L47)

Loading state — spread to ComboboxField loading prop.

***

### onSearch()

> **onSearch**: (`query`) => `void`

Defined in: [packages/ui/src/crud/list/use-server-search-options.ts:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-server-search-options.ts#L49)

Search handler — spread to ComboboxField onSearch prop.

#### Parameters

##### query

`string`

#### Returns

`void`

***

### options

> **options**: `object`[]

Defined in: [packages/ui/src/crud/list/use-server-search-options.ts:45](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-server-search-options.ts#L45)

Mapped options from server response. Includes selectedOption if not in results.

#### icon?

> `optional` **icon**: `ReactNode`

#### label

> **label**: `string`

#### value

> **value**: `string`
