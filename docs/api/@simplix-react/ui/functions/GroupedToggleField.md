[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / GroupedToggleField

# Function: GroupedToggleField()

> **GroupedToggleField**\<`T`\>(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/form/grouped-toggle-field.tsx:149](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/grouped-toggle-field.tsx#L149)

Grouped inline multi-select. Each group renders an icon title, an optional
select-all switch, and a row of toggle chips. Selection is namespaced per
group (`Record<groupId, T[]>`), so option values may repeat across groups.

## Type Parameters

### T

`T` *extends* `string` = `string`

## Parameters

### \_\_namedParameters

[`GroupedToggleFieldProps`](../interfaces/GroupedToggleFieldProps.md)\<`T`\>

## Returns

`Element`

## Example

```tsx
<GroupedToggleField
  label="Allowed file types"
  value={{ image: ["image/jpeg"], doc: [] }}
  onChange={setValue}
  groups={[
    {
      id: "image",
      label: "Image",
      icon: "image",
      options: [
        { value: "image/jpeg", label: "JPG" },
        { value: "image/png", label: "PNG" },
      ],
    },
  ]}
/>
```
