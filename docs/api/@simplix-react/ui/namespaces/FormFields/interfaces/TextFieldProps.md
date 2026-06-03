[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / TextFieldProps

# Interface: TextFieldProps

Defined in: [packages/ui/src/fields/form/text-field.tsx:11](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/text-field.tsx#L11)

Props for the [TextField](../functions/TextField.md) form component.

## Extends

- [`CommonFieldProps`](../../../interfaces/CommonFieldProps.md)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L30)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`className`](../../../interfaces/CommonFieldProps.md#classname)

***

### colorValue?

> `optional` **colorValue**: `string`

Defined in: [packages/ui/src/fields/form/text-field.tsx:34](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/text-field.tsx#L34)

Convenience: current color (hex). When provided, a ColorPicker is rendered as suffixControl.

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

### iconValue?

> `optional` **iconValue**: `string`

Defined in: [packages/ui/src/fields/form/text-field.tsx:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/text-field.tsx#L30)

Convenience: current icon name. When provided, an IconPicker is rendered as prefixControl.

***

### inputProps?

> `optional` **inputProps**: `DetailedHTMLProps`\<`InputHTMLAttributes`\<`HTMLInputElement`\>, `HTMLInputElement`\>

Defined in: [packages/ui/src/fields/form/text-field.tsx:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/text-field.tsx#L21)

Additional props forwarded to the underlying input element.

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

### layout?

> `optional` **layout**: `"inline"` \| `"left"` \| `"top"` \| `"hidden"`

Defined in: [packages/ui/src/crud/shared/types.ts:5](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L5)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`layout`](../../../interfaces/FieldVariant.md#layout)

***

### maxLength?

> `optional` **maxLength**: `number`

Defined in: [packages/ui/src/fields/form/text-field.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/text-field.tsx#L17)

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/text-field.tsx:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/text-field.tsx#L15)

Called when the value changes.

#### Parameters

##### value

`string`

#### Returns

`void`

***

### onColorChange()?

> `optional` **onColorChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/text-field.tsx:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/text-field.tsx#L36)

Convenience: called when the color changes.

#### Parameters

##### value

`string`

#### Returns

`void`

***

### onIconChange()?

> `optional` **onIconChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/text-field.tsx:32](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/text-field.tsx#L32)

Convenience: called when the icon changes.

#### Parameters

##### value

`string`

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/fields/form/text-field.tsx:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/text-field.tsx#L16)

***

### prefixControl?

> `optional` **prefixControl**: `ReactNode`

Defined in: [packages/ui/src/fields/form/text-field.tsx:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/text-field.tsx#L26)

Control rendered on the leading side of the input (same row).
Use for IconPicker, ColorPicker, or similar adornments. Takes precedence over [iconValue](#iconvalue).

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

### suffixControl?

> `optional` **suffixControl**: `ReactNode`

Defined in: [packages/ui/src/fields/form/text-field.tsx:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/text-field.tsx#L28)

Control rendered on the trailing side of the input (same row).

***

### type?

> `optional` **type**: `"text"` \| `"tel"` \| `"url"` \| `"email"` \| `"password"`

Defined in: [packages/ui/src/fields/form/text-field.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/text-field.tsx#L19)

HTML input type. Defaults to `"text"`.

***

### value

> **value**: `string`

Defined in: [packages/ui/src/fields/form/text-field.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/text-field.tsx#L13)

Current input value.

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L26)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`warning`](../../../interfaces/CommonFieldProps.md#warning)
