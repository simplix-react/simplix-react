[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / SelectField

# Function: SelectField()

> **SelectField**\<`T`\>(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/form/select-field.tsx:74](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/select-field.tsx#L74)

Dropdown select field built on Radix Select primitives.

## Type Parameters

### T

`T` *extends* `string` = `string`

## Parameters

### \_\_namedParameters

[`SelectFieldProps`](../interfaces/SelectFieldProps.md)\<`T`\>

## Returns

`Element`

## Remarks

Two widths, and which one applies is decided by `compact`. The default (non-compact) field
renders inside `FieldWrapper` and takes the width its container gives it, with `className`
reaching that wrapper. `compact` instead measures itself against its longest option label —
a hidden native `<select>` carrying every label does the measuring, so the field is as wide
as its widest option and `className` is dropped on the floor. Pass `fill` alongside `compact`
to take that measurement out and let the parent set the width.

## Example

```tsx
<SelectField
  label="Role"
  value={role}
  onChange={setRole}
  options={[
    { label: "Admin", value: "admin" },
    { label: "User", value: "user" },
  ]}
/>

// Compact mode (no label, auto-width, for table cells)
<SelectField
  compact
  value={scheduleId}
  onChange={setScheduleId}
  options={scheduleOptions}
  placeholder="Select..."
/>

// Compact mode whose width the parent owns (a grid cell, a flex row)
<SelectField
  compact
  fill
  className="min-w-0"
  value={areaId}
  onChange={setAreaId}
  options={areaOptions}
/>
```
