[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / ComboboxField

# Function: ComboboxField()

> **ComboboxField**\<`T`\>(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/form/combobox-field.tsx:38](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/combobox-field.tsx#L38)

Searchable dropdown field with popover-based filtering.
Trigger displays selected value as text; search input is inside the popover.

## Type Parameters

### T

`T` *extends* `string` = `string`

## Parameters

### \_\_namedParameters

[`ComboboxFieldProps`](../interfaces/ComboboxFieldProps.md)\<`T`\>

## Returns

`Element`

## Example

```tsx
<ComboboxField
  label="Country"
  value={country}
  onChange={setCountry}
  options={countries}
  onSearch={searchCountries}
  loading={isSearching}
/>
```
