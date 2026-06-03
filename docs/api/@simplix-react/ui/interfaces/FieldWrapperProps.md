[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / FieldWrapperProps

# Interface: FieldWrapperProps

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L30)

Props for the [FieldWrapper](../functions/FieldWrapper.md) component.

## Extends

- `Partial`\<[`FieldVariant`](FieldVariant.md)\>

## Properties

### children

> **children**: `ReactNode`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:57](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L57)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:56](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L56)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:42](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L42)

Help text displayed below the field.

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:46](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L46)

Whether the field is disabled.

***

### error?

> `optional` **error**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:38](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L38)

Error message displayed below the field (highest priority).

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:32](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L32)

Visible label text for the field.

***

### labelExtra?

> `optional` **labelExtra**: `ReactNode`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L36)

Content rendered at the right side of the label area (e.g., LanguageSelector).

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:34](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L34)

i18n key for label resolution.

***

### layout?

> `optional` **layout**: `"inline"` \| `"left"` \| `"top"` \| `"hidden"`

Defined in: [packages/ui/src/crud/shared/types.ts:5](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L5)

#### Inherited from

[`FieldVariant`](FieldVariant.md).[`layout`](FieldVariant.md#layout)

***

### prefixControl?

> `optional` **prefixControl**: `ReactNode`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:51](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L51)

Control rendered on the leading (left in LTR) side of the input, on the same row.
Use for IconPicker, ColorPicker, or similar adornments.

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:44](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L44)

Whether the field is required (shows asterisk).

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:6](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L6)

#### Inherited from

[`FieldVariant`](FieldVariant.md).[`size`](FieldVariant.md#size)

***

### suffixControl?

> `optional` **suffixControl**: `ReactNode`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:55](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L55)

Control rendered on the trailing (right in LTR) side of the input, on the same row.

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:40](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L40)

Warning message displayed below the field (shown when no error).
