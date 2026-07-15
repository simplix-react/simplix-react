[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / FieldWrapperProps

# Interface: FieldWrapperProps

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:31](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L31)

Props for the [FieldWrapper](../functions/FieldWrapper.md) component.

## Extends

- `Partial`\<[`FieldVariant`](FieldVariant.md)\>

## Properties

### children

> **children**: `ReactNode`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:58](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L58)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:57](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L57)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:43](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L43)

Help text displayed below the field.

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:47](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L47)

Whether the field is disabled.

***

### error?

> `optional` **error**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:39](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L39)

Error message displayed below the field (highest priority).

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L33)

Visible label text for the field.

***

### labelExtra?

> `optional` **labelExtra**: `ReactNode`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:37](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L37)

Content rendered at the right side of the label area (e.g., LanguageSelector).

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L35)

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

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:52](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L52)

Control rendered on the leading (left in LTR) side of the input, on the same row.
Use for IconPicker, ColorPicker, or similar adornments.

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:45](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L45)

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

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:56](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L56)

Control rendered on the trailing (right in LTR) side of the input, on the same row.

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:41](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L41)

Warning message displayed below the field (shown when no error).
