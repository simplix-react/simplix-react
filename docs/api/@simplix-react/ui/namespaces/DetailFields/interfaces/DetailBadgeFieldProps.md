[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailBadgeFieldProps

# Interface: DetailBadgeFieldProps\<T\>

Defined in: [packages/ui/src/fields/detail/badge-field.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/badge-field.tsx#L13)

Props for the [DetailBadgeField](../functions/DetailBadgeField.md) component.

## Extends

- [`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md)

## Type Parameters

### T

`T` *extends* `string` = `string`

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:56](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L56)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`className`](../../../interfaces/CommonDetailFieldProps.md#classname)

***

### displayValue?

> `optional` **displayValue**: `string`

Defined in: [packages/ui/src/fields/detail/badge-field.tsx:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/badge-field.tsx#L18)

Translated or formatted text to display inside the badge. Falls back to [value](#value) when omitted.

***

### fallback?

> `optional` **fallback**: `string`

Defined in: [packages/ui/src/fields/detail/badge-field.tsx:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/badge-field.tsx#L22)

Fallback text when value is null, undefined, or empty string. Defaults to the shared no-value badge.

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

> **value**: `T` \| `null` \| `undefined`

Defined in: [packages/ui/src/fields/detail/badge-field.tsx:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/badge-field.tsx#L16)

The current status/category value (used for variant lookup).

***

### variants

> **variants**: `Record`\<`T`, [`BadgeVariant`](../type-aliases/BadgeVariant.md)\>

Defined in: [packages/ui/src/fields/detail/badge-field.tsx:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/badge-field.tsx#L20)

Mapping from value to badge variant for visual differentiation.
