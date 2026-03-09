[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useOrvalOptions

# Function: useOrvalOptions()

> **useOrvalOptions**\<`TItem`\>(`useQuery`, `config`): [`UseOrvalOptionsResult`](../interfaces/UseOrvalOptionsResult.md)

Defined in: [packages/ui/src/crud/list/use-orval-options.ts:44](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-orval-options.ts#L44)

Convert an Orval-generated list/search hook result into `{ label, value }[]` options
suitable for ComboboxField, SelectField, or MultiSelectField.

Handles Boot-envelope-unwrapped responses (Spring Data Page: `{ content: T[] }`).

## Type Parameters

### TItem

`TItem`

Item type in the paginated response.

## Parameters

### useQuery

[`OrvalOptionsHookLike`](../type-aliases/OrvalOptionsHookLike.md)

Orval-generated list/search hook.

### config

[`UseOrvalOptionsConfig`](../interfaces/UseOrvalOptionsConfig.md)\<`TItem`\>

Mapping and query configuration.

## Returns

[`UseOrvalOptionsResult`](../interfaces/UseOrvalOptionsResult.md)

## Example

```tsx
const { options, isLoading } = useOrvalOptions(useHolidayTypeRestSimpleSearch, {
  toOption: (t) => ({ label: t.name, value: String(t.id) }),
});
```
