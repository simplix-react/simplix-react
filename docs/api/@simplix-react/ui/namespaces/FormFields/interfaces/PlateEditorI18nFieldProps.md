[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / PlateEditorI18nFieldProps

# Interface: PlateEditorI18nFieldProps

Defined in: [packages/ui/src/fields/form/plate-editor-i18n-field.tsx:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/plate-editor-i18n-field.tsx#L20)

Shared props for all form field components.

## Extends

- [`CommonFieldProps`](../../../interfaces/CommonFieldProps.md)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L30)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`className`](../../../interfaces/CommonFieldProps.md#classname)

***

### defaultHeight?

> `optional` **defaultHeight**: `string` \| `number`

Defined in: [packages/ui/src/fields/form/plate-editor-i18n-field.tsx:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/plate-editor-i18n-field.tsx#L28)

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

### languages

> **languages**: `LocaleConfig`[]

Defined in: [packages/ui/src/fields/form/plate-editor-i18n-field.tsx:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/plate-editor-i18n-field.tsx#L23)

***

### layout?

> `optional` **layout**: `"inline"` \| `"left"` \| `"top"` \| `"hidden"`

Defined in: [packages/ui/src/crud/shared/types.ts:5](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L5)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`layout`](../../../interfaces/FieldVariant.md#layout)

***

### maxHeight?

> `optional` **maxHeight**: `string` \| `number`

Defined in: [packages/ui/src/fields/form/plate-editor-i18n-field.tsx:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/plate-editor-i18n-field.tsx#L30)

***

### minHeight?

> `optional` **minHeight**: `string` \| `number`

Defined in: [packages/ui/src/fields/form/plate-editor-i18n-field.tsx:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/plate-editor-i18n-field.tsx#L29)

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/plate-editor-i18n-field.tsx:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/plate-editor-i18n-field.tsx#L22)

#### Parameters

##### value

`Record`\<`LocaleCode`, `string`\>

#### Returns

`void`

***

### onLanguageChange()?

> `optional` **onLanguageChange**: (`language`) => `void`

Defined in: [packages/ui/src/fields/form/plate-editor-i18n-field.tsx:25](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/plate-editor-i18n-field.tsx#L25)

#### Parameters

##### language

`string`

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/fields/form/plate-editor-i18n-field.tsx:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/plate-editor-i18n-field.tsx#L27)

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L28)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`required`](../../../interfaces/CommonFieldProps.md#required)

***

### resizable?

> `optional` **resizable**: `boolean`

Defined in: [packages/ui/src/fields/form/plate-editor-i18n-field.tsx:31](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/plate-editor-i18n-field.tsx#L31)

***

### selectedLanguage?

> `optional` **selectedLanguage**: `string`

Defined in: [packages/ui/src/fields/form/plate-editor-i18n-field.tsx:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/plate-editor-i18n-field.tsx#L24)

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:6](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L6)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### value

> **value**: `Record`\<`LocaleCode`, `string`\>

Defined in: [packages/ui/src/fields/form/plate-editor-i18n-field.tsx:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/plate-editor-i18n-field.tsx#L21)

***

### variant?

> `optional` **variant**: [`PlateEditorVariant`](../type-aliases/PlateEditorVariant.md)

Defined in: [packages/ui/src/fields/form/plate-editor-i18n-field.tsx:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/plate-editor-i18n-field.tsx#L26)

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L26)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`warning`](../../../interfaces/CommonFieldProps.md#warning)
