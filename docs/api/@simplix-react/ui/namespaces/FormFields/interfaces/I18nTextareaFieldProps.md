[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / I18nTextareaFieldProps

# Interface: I18nTextareaFieldProps

Defined in: [packages/ui/src/fields/form/i18n-textarea-field.tsx:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-textarea-field.tsx#L12)

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

Defined in: [packages/ui/src/fields/form/i18n-textarea-field.tsx:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-textarea-field.tsx#L15)

***

### layout?

> `optional` **layout**: `"inline"` \| `"left"` \| `"top"` \| `"hidden"`

Defined in: [packages/ui/src/crud/shared/types.ts:5](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L5)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`layout`](../../../interfaces/FieldVariant.md#layout)

***

### maxLength?

> `optional` **maxLength**: `number`

Defined in: [packages/ui/src/fields/form/i18n-textarea-field.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-textarea-field.tsx#L19)

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/i18n-textarea-field.tsx:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-textarea-field.tsx#L14)

#### Parameters

##### value

[`I18nValue`](../type-aliases/I18nValue.md)

#### Returns

`void`

***

### onLanguageChange()?

> `optional` **onLanguageChange**: (`language`) => `void`

Defined in: [packages/ui/src/fields/form/i18n-textarea-field.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-textarea-field.tsx#L17)

#### Parameters

##### language

`string`

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder**: `string` \| [`I18nValue`](../type-aliases/I18nValue.md)

Defined in: [packages/ui/src/fields/form/i18n-textarea-field.tsx:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-textarea-field.tsx#L18)

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L28)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`required`](../../../interfaces/CommonFieldProps.md#required)

***

### resize?

> `optional` **resize**: `"none"` \| `"both"` \| `"vertical"`

Defined in: [packages/ui/src/fields/form/i18n-textarea-field.tsx:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-textarea-field.tsx#L21)

***

### rows?

> `optional` **rows**: `number`

Defined in: [packages/ui/src/fields/form/i18n-textarea-field.tsx:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-textarea-field.tsx#L20)

***

### selectedLanguage?

> `optional` **selectedLanguage**: `string`

Defined in: [packages/ui/src/fields/form/i18n-textarea-field.tsx:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-textarea-field.tsx#L16)

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:6](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L6)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### textareaProps?

> `optional` **textareaProps**: `DetailedHTMLProps`\<`TextareaHTMLAttributes`\<`HTMLTextAreaElement`\>, `HTMLTextAreaElement`\>

Defined in: [packages/ui/src/fields/form/i18n-textarea-field.tsx:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-textarea-field.tsx#L22)

***

### value

> **value**: [`I18nValue`](../type-aliases/I18nValue.md)

Defined in: [packages/ui/src/fields/form/i18n-textarea-field.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-textarea-field.tsx#L13)

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L26)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`warning`](../../../interfaces/CommonFieldProps.md#warning)
