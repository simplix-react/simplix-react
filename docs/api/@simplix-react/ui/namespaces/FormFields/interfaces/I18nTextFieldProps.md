[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / I18nTextFieldProps

# Interface: I18nTextFieldProps

Defined in: [packages/ui/src/fields/form/i18n-text-field.tsx:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-text-field.tsx#L14)

Shared props for all form field components.

## Extends

- [`CommonFieldProps`](../../../interfaces/CommonFieldProps.md)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L49)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`className`](../../../interfaces/CommonFieldProps.md#classname)

***

### colorValue?

> `optional` **colorValue**: `string`

Defined in: [packages/ui/src/fields/form/i18n-text-field.tsx:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-text-field.tsx#L36)

Convenience: current color (hex). When provided, a ColorPicker is rendered as suffixControl.

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

### iconValue?

> `optional` **iconValue**: `string`

Defined in: [packages/ui/src/fields/form/i18n-text-field.tsx:32](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-text-field.tsx#L32)

Convenience: current icon name. When provided, an IconPicker is rendered as prefixControl.

***

### inputProps?

> `optional` **inputProps**: `DetailedHTMLProps`\<`InputHTMLAttributes`\<`HTMLInputElement`\>, `HTMLInputElement`\>

Defined in: [packages/ui/src/fields/form/i18n-text-field.tsx:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-text-field.tsx#L23)

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

### languages

> **languages**: `LocaleConfig`[]

Defined in: [packages/ui/src/fields/form/i18n-text-field.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-text-field.tsx#L17)

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

### maxLength?

> `optional` **maxLength**: `number`

Defined in: [packages/ui/src/fields/form/i18n-text-field.tsx:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-text-field.tsx#L21)

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/i18n-text-field.tsx:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-text-field.tsx#L16)

#### Parameters

##### value

[`I18nValue`](../type-aliases/I18nValue.md)

#### Returns

`void`

***

### onColorChange()?

> `optional` **onColorChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/i18n-text-field.tsx:38](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-text-field.tsx#L38)

Convenience: called when the color changes.

#### Parameters

##### value

`string`

#### Returns

`void`

***

### onIconChange()?

> `optional` **onIconChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/i18n-text-field.tsx:34](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-text-field.tsx#L34)

Convenience: called when the icon changes.

#### Parameters

##### value

`string`

#### Returns

`void`

***

### onLanguageChange()?

> `optional` **onLanguageChange**: (`language`) => `void`

Defined in: [packages/ui/src/fields/form/i18n-text-field.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-text-field.tsx#L19)

#### Parameters

##### language

`string`

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder**: `string` \| [`I18nValue`](../type-aliases/I18nValue.md)

Defined in: [packages/ui/src/fields/form/i18n-text-field.tsx:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-text-field.tsx#L20)

***

### prefixControl?

> `optional` **prefixControl**: `ReactNode`

Defined in: [packages/ui/src/fields/form/i18n-text-field.tsx:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-text-field.tsx#L28)

Control rendered on the leading side of the input (same row).
Takes precedence over [I18nTextFieldProps.iconValue](#iconvalue).

#### Overrides

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`prefixControl`](../../../interfaces/CommonFieldProps.md#prefixcontrol)

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L35)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`required`](../../../interfaces/CommonFieldProps.md#required)

***

### selectedLanguage?

> `optional` **selectedLanguage**: `string`

Defined in: [packages/ui/src/fields/form/i18n-text-field.tsx:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-text-field.tsx#L18)

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L13)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### suffixControl?

> `optional` **suffixControl**: `ReactNode`

Defined in: [packages/ui/src/fields/form/i18n-text-field.tsx:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-text-field.tsx#L30)

Control rendered on the trailing side of the input (same row).

#### Overrides

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`suffixControl`](../../../interfaces/CommonFieldProps.md#suffixcontrol)

***

### type?

> `optional` **type**: `"text"` \| `"tel"` \| `"url"` \| `"email"`

Defined in: [packages/ui/src/fields/form/i18n-text-field.tsx:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-text-field.tsx#L22)

***

### value

> **value**: [`I18nValue`](../type-aliases/I18nValue.md)

Defined in: [packages/ui/src/fields/form/i18n-text-field.tsx:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/i18n-text-field.tsx#L15)

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L33)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`warning`](../../../interfaces/CommonFieldProps.md#warning)
