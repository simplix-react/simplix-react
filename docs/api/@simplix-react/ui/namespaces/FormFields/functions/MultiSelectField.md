[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / MultiSelectField

# Function: MultiSelectField()

> **MultiSelectField**\<`T`\>(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/form/multi-select-field.tsx:44](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/fields/form/multi-select-field.tsx#L44)

Multi-select dropdown field with badge chips and search filtering.

## Type Parameters

### T

`T` *extends* `string` = `string`

## Parameters

### \_\_namedParameters

[`MultiSelectFieldProps`](../interfaces/MultiSelectFieldProps.md)\<`T`\>

## Returns

`Element`

## Example

```tsx
<MultiSelectField
  label="Tags"
  value={tags}
  onChange={setTags}
  options={[
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Angular", value: "angular" },
  ]}
/>
```
