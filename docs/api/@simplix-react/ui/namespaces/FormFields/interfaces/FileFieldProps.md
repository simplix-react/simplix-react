[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / FileFieldProps

# Interface: FileFieldProps

Defined in: [packages/ui/src/fields/file-attachment/types.ts:129](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L129)

Props for the FileField form component.
Extends CommonFieldProps (label, error, disabled, layout, size, etc.).

NOTE (DEC-1/UD-8): initialAttachments is the SINGLE init path — the hook
does NOT call api.list() on mount. Callers pre-fetch and pass the list here.

## Extends

- [`CommonFieldProps`](../../../interfaces/CommonFieldProps.md)

## Properties

### api

> **api**: `FileFieldApi`

Defined in: [packages/ui/src/fields/file-attachment/types.ts:143](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L143)

API implementation provided by the caller.

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L30)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`className`](../../../interfaces/CommonFieldProps.md#classname)

***

### config?

> `optional` **config**: `FileFieldConfig`

Defined in: [packages/ui/src/fields/file-attachment/types.ts:145](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L145)

Capacity / MIME constraints.

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L27)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`description`](../../../interfaces/CommonFieldProps.md#description)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L29)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`disabled`](../../../interfaces/CommonFieldProps.md#disabled)

***

### error?

> `optional` **error**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:25](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L25)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`error`](../../../interfaces/CommonFieldProps.md#error)

***

### initialAttachments?

> `optional` **initialAttachments**: `AttachmentRecord`[]

Defined in: [packages/ui/src/fields/file-attachment/types.ts:141](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L141)

Seed for the hook's internal items state (DEC-1/UD-8).
Pass the pre-fetched attachment list from the server here.
The hook will NOT call api.list() on mount.

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L23)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`label`](../../../interfaces/CommonFieldProps.md#label)

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L24)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`labelKey`](../../../interfaces/CommonFieldProps.md#labelkey)

***

### languages?

> `optional` **languages**: `LocaleConfig`[]

Defined in: [packages/ui/src/fields/file-attachment/types.ts:150](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L150)

Supported locale list for the i18n description dialog.
When omitted the dialog renders a single plain-text input.

***

### layout?

> `optional` **layout**: `"inline"` \| `"left"` \| `"top"` \| `"hidden"`

Defined in: [packages/ui/src/crud/shared/types.ts:5](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L5)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`layout`](../../../interfaces/FieldVariant.md#layout)

***

### onAuthError()?

> `optional` **onAuthError**: (`error`) => `void`

Defined in: [packages/ui/src/fields/file-attachment/types.ts:135](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L135)

Called when an API call returns 401 or 403 (R2-5/R2-6).

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/file-attachment/types.ts:133](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L133)

Called whenever the completed attachment list changes.

#### Parameters

##### value

`AttachmentRecord`[]

#### Returns

`void`

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L28)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`required`](../../../interfaces/CommonFieldProps.md#required)

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:6](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L6)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### value

> **value**: `AttachmentRecord`[]

Defined in: [packages/ui/src/fields/file-attachment/types.ts:131](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L131)

Controlled list of completed attachments (server records).

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L26)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`warning`](../../../interfaces/CommonFieldProps.md#warning)
