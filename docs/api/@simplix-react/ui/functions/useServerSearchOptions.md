[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useServerSearchOptions

# Function: useServerSearchOptions()

> **useServerSearchOptions**\<`TItem`\>(`useSearchQuery`, `config`): [`UseServerSearchOptionsReturn`](../interfaces/UseServerSearchOptionsReturn.md)

Defined in: [packages/ui/src/crud/list/use-server-search-options.ts:63](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-server-search-options.ts#L63)

Server-side search hook for ComboboxField.
Follows useOrvalOptions conventions with reactive search capability.

Reuses existing /search endpoints with

## Type Parameters

### TItem

`TItem`

## Parameters

### useSearchQuery

[`OrvalOptionsHookLike`](../type-aliases/OrvalOptionsHookLike.md)

Orval-generated search hook for the domain.

### config

[`UseServerSearchOptionsConfig`](../interfaces/UseServerSearchOptionsConfig.md)\<`TItem`\>

Search field, mapping, and behavior configuration.

## Returns

[`UseServerSearchOptionsReturn`](../interfaces/UseServerSearchOptionsReturn.md)

## Searchable Params

format.
Handles debounce, minimum query length, TanStack Query lifecycle,
and Page<ListDTO> response unwrapping (same as useOrvalOptions).
