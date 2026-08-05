[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / FieldWrapperProps

# Interface: FieldWrapperProps

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:62](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L62)

Props for the [FieldWrapper](../functions/FieldWrapper.md) component.

## Extends

- `Partial`\<[`FieldVariant`](FieldVariant.md)\>

## Properties

### children

> **children**: [`FieldWrapperChildren`](../type-aliases/FieldWrapperChildren.md)

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:89](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L89)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:88](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L88)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:74](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L74)

Help text displayed below the field.

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:78](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L78)

Whether the field is disabled.

***

### error?

> `optional` **error**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:70](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L70)

Error message displayed below the field (highest priority).

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:64](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L64)

Visible label text for the field.

***

### labelExtra?

> `optional` **labelExtra**: `ReactNode`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:68](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L68)

Content rendered at the right side of the label area (e.g., LanguageSelector).

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:66](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L66)

i18n key for label resolution.

***

### layout?

> `optional` **layout**: `"inline"` \| `"left"` \| `"top"` \| `"hidden"` \| `"trailing"`

Defined in: [packages/ui/src/crud/shared/types.ts:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L12)

Label placement. `"top"` stacks the label above the input, `"left"` puts
it in a leading column, `"inline"` keeps label and input on one row,
`"trailing"` right-aligns the control with a dashed leader line from the
label (settings-row style, used by toggle fields), `"hidden"` renders the
label for screen readers only.

#### Inherited from

[`FieldVariant`](FieldVariant.md).[`layout`](FieldVariant.md#layout)

***

### prefixControl?

> `optional` **prefixControl**: `ReactNode`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:83](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L83)

Control rendered on the leading (left in LTR) side of the input, on the same row.
Use for IconPicker, ColorPicker, or similar adornments.

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:76](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L76)

Whether the field is required (shows asterisk).

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L13)

#### Inherited from

[`FieldVariant`](FieldVariant.md).[`size`](FieldVariant.md#size)

***

### suffixControl?

> `optional` **suffixControl**: `ReactNode`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:87](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L87)

Control rendered on the trailing (right in LTR) side of the input, on the same row.

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:72](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L72)

Warning message displayed below the field (shown when no error).
