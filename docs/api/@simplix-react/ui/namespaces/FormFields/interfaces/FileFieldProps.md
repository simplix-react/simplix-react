[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / FileFieldProps

# Interface: FileFieldProps

Defined in: [packages/ui/src/fields/file-attachment/types.ts:175](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L175)

Props for the FileField form component.
Extends CommonFieldProps (label, error, disabled, layout, size, etc.).

NOTE (DEC-1/UD-8): initialAttachments is the SINGLE init path — the hook
does NOT call api.list() on mount. Callers pre-fetch and pass the list here.

## Extends

- [`CommonFieldProps`](../../../interfaces/CommonFieldProps.md)

## Properties

### api

> **api**: [`FileFieldApi`](../../../interfaces/FileFieldApi.md)

Defined in: [packages/ui/src/fields/file-attachment/types.ts:189](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L189)

API implementation provided by the caller.

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L49)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`className`](../../../interfaces/CommonFieldProps.md#classname)

***

### config?

> `optional` **config**: `FileFieldConfig`

Defined in: [packages/ui/src/fields/file-attachment/types.ts:191](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L191)

Capacity / MIME constraints.

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

Defined in: [packages/ui/src/fields/file-attachment/types.ts:187](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L187)

Seed for the hook's internal items state (DEC-1/UD-8).
Pass the pre-fetched attachment list from the server here.
The hook will NOT call api.list() on mount.

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

Defined in: [packages/ui/src/fields/file-attachment/types.ts:196](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L196)

Supported locale list for the i18n description dialog.
When omitted the dialog renders a single plain-text input.

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

### onAuthError()?

> `optional` **onAuthError**: (`error`) => `void`

Defined in: [packages/ui/src/fields/file-attachment/types.ts:181](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L181)

Called when an API call returns 401 or 403 (R2-5/R2-6).

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/file-attachment/types.ts:179](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L179)

Called whenever the completed attachment list changes.

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

Defined in: [packages/ui/src/fields/file-attachment/types.ts:177](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L177)

Controlled list of completed attachments (server records).

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L33)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`warning`](../../../interfaces/CommonFieldProps.md#warning)
