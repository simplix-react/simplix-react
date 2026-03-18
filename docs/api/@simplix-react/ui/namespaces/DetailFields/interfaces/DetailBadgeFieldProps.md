[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailBadgeFieldProps

# Interface: DetailBadgeFieldProps\<T\>

Defined in: [packages/ui/src/fields/detail/badge-field.tsx:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/badge-field.tsx#L12)

Props for the [DetailBadgeField](../functions/DetailBadgeField.md) component.

## Extends

- [`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md)

## Type Parameters

### T

`T` *extends* `string` = `string`

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:37](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L37)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`className`](../../../interfaces/CommonDetailFieldProps.md#classname)

***

### displayValue?

> `optional` **displayValue**: `string`

Defined in: [packages/ui/src/fields/detail/badge-field.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/badge-field.tsx#L17)

Translated or formatted text to display inside the badge. Falls back to [value](#value) when omitted.

***

### fallback?

> `optional` **fallback**: `string`

Defined in: [packages/ui/src/fields/detail/badge-field.tsx:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/badge-field.tsx#L21)

Fallback text when value is null, undefined, or empty string. Defaults to em-dash.

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L35)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`label`](../../../interfaces/CommonDetailFieldProps.md#label)

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L36)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`labelKey`](../../../interfaces/CommonDetailFieldProps.md#labelkey)

***

### layout?

> `optional` **layout**: `"inline"` \| `"left"` \| `"top"` \| `"hidden"`

Defined in: [packages/ui/src/crud/shared/types.ts:5](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L5)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`layout`](../../../interfaces/FieldVariant.md#layout)

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:6](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L6)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### value

> **value**: `T` \| `null` \| `undefined`

Defined in: [packages/ui/src/fields/detail/badge-field.tsx:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/badge-field.tsx#L15)

The current status/category value (used for variant lookup).

***

### variants

> **variants**: `Record`\<`T`, [`BadgeVariant`](../type-aliases/BadgeVariant.md)\>

Defined in: [packages/ui/src/fields/detail/badge-field.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/badge-field.tsx#L19)

Mapping from value to badge variant for visual differentiation.
