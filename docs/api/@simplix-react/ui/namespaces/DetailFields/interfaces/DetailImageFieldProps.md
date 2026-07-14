[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailImageFieldProps

# Interface: DetailImageFieldProps

Defined in: [packages/ui/src/fields/detail/image-field.tsx:8](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/image-field.tsx#L8)

Props for the [DetailImageField](../functions/DetailImageField.md) component.

## Extends

- [`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md)

## Properties

### alt?

> `optional` **alt**: `string`

Defined in: [packages/ui/src/fields/detail/image-field.tsx:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/image-field.tsx#L12)

Alt text for the image.

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:56](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L56)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`className`](../../../interfaces/CommonDetailFieldProps.md#classname)

***

### height?

> `optional` **height**: `string` \| `number`

Defined in: [packages/ui/src/fields/detail/image-field.tsx:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/image-field.tsx#L16)

Image height in pixels or CSS value. Defaults to `96`.

***

### imageClassName?

> `optional` **imageClassName**: `string`

Defined in: [packages/ui/src/fields/detail/image-field.tsx:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/image-field.tsx#L18)

Additional CSS class for the image element.

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:54](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L54)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`label`](../../../interfaces/CommonDetailFieldProps.md#label)

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:55](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L55)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`labelKey`](../../../interfaces/CommonDetailFieldProps.md#labelkey)

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

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L13)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### value

> **value**: `string` \| `null` \| `undefined`

Defined in: [packages/ui/src/fields/detail/image-field.tsx:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/image-field.tsx#L10)

Image source URL.

***

### width?

> `optional` **width**: `string` \| `number`

Defined in: [packages/ui/src/fields/detail/image-field.tsx:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/image-field.tsx#L14)

Image width in pixels or CSS value. Defaults to `96`.
