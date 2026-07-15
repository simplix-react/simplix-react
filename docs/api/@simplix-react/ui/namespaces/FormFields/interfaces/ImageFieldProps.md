[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / ImageFieldProps

# Interface: ImageFieldProps

Defined in: [packages/ui/src/fields/form/image-field.tsx:41](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/image-field.tsx#L41)

Shared props for all form field components.

## Extends

- [`CommonFieldProps`](../../../interfaces/CommonFieldProps.md)

## Properties

### api

> **api**: [`FileFieldApi`](../../../interfaces/FileFieldApi.md)

Defined in: [packages/ui/src/fields/form/image-field.tsx:47](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/image-field.tsx#L47)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L49)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`className`](../../../interfaces/CommonFieldProps.md#classname)

***

### config?

> `optional` **config**: `FileFieldConfig`

Defined in: [packages/ui/src/fields/form/image-field.tsx:48](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/image-field.tsx#L48)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:34](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L34)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`description`](../../../interfaces/CommonFieldProps.md#description)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L36)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`disabled`](../../../interfaces/CommonFieldProps.md#disabled)

***

### error?

> `optional` **error**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:32](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L32)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`error`](../../../interfaces/CommonFieldProps.md#error)

***

### initialAttachments?

> `optional` **initialAttachments**: [`AttachmentRecord`](../../../interfaces/AttachmentRecord.md)[]

Defined in: [packages/ui/src/fields/form/image-field.tsx:46](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/image-field.tsx#L46)

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L30)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`label`](../../../interfaces/CommonFieldProps.md#label)

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:31](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L31)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`labelKey`](../../../interfaces/CommonFieldProps.md#labelkey)

***

### languages?

> `optional` **languages**: `LocaleConfig`[]

Defined in: [packages/ui/src/fields/form/image-field.tsx:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/image-field.tsx#L49)

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

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`layout`](../../../interfaces/FieldVariant.md#layout)

***

### maxCount

> **maxCount**: `number`

Defined in: [packages/ui/src/fields/form/image-field.tsx:58](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/image-field.tsx#L58)

Maximum number of images that can be attached.
  1  → Single mode (StageDropzone + crop + bottom-right actions, representative toggle off)
  >=2 → Multi mode (compact Dropzone + ThumbStrip + FileList, representative toggle on)
OQ-2: maxCount serves as both mode selector and effective attachment limit.
      config.maxAttachments is overridden by maxCount.

***

### onAuthError()?

> `optional` **onAuthError**: (`error`) => `void`

Defined in: [packages/ui/src/fields/form/image-field.tsx:45](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/image-field.tsx#L45)

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/image-field.tsx:44](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/image-field.tsx#L44)

#### Parameters

##### value

[`AttachmentRecord`](../../../interfaces/AttachmentRecord.md)[]

#### Returns

`void`

***

### prefixControl?

> `optional` **prefixControl**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/types.ts:41](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L41)

Control rendered on the leading (left in LTR) side of the input, on the
same row. Use for IconPicker, ColorPicker, or similar adornments.

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`prefixControl`](../../../interfaces/CommonFieldProps.md#prefixcontrol)

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L35)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`required`](../../../interfaces/CommonFieldProps.md#required)

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L13)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### suffixControl?

> `optional` **suffixControl**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/types.ts:48](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L48)

Control rendered on the trailing (right in LTR) side of the input, on the
same row. Use instead of composing a button next to the field — the
control stays aligned with the input while description and error render
below at full width.

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`suffixControl`](../../../interfaces/CommonFieldProps.md#suffixcontrol)

***

### value

> **value**: [`AttachmentRecord`](../../../interfaces/AttachmentRecord.md)[]

Defined in: [packages/ui/src/fields/form/image-field.tsx:43](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/image-field.tsx#L43)

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L33)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`warning`](../../../interfaces/CommonFieldProps.md#warning)
