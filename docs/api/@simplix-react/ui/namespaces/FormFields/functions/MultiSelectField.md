[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / MultiSelectField

# Function: MultiSelectField()

> **MultiSelectField**\<`T`\>(`__namedParameters`): `Element`

Defined in: packages/ui/src/fields/form/multi-select-field.tsx:44

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
