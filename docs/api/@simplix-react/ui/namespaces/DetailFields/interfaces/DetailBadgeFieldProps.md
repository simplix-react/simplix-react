[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailBadgeFieldProps

# Interface: DetailBadgeFieldProps\<T\>

Defined in: packages/ui/src/fields/detail/badge-field.tsx:12

Props for the [DetailBadgeField](../functions/DetailBadgeField.md) component.

## Extends

- [`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md)

## Type Parameters

### T

`T` *extends* `string` = `string`

## Properties

### className?

> `optional` **className**: `string`

Defined in: packages/ui/src/crud/shared/types.ts:36

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`className`](../../../interfaces/CommonDetailFieldProps.md#classname)

***

### displayValue?

> `optional` **displayValue**: `string`

Defined in: packages/ui/src/fields/detail/badge-field.tsx:17

Translated or formatted text to display inside the badge. Falls back to [value](#value) when omitted.

***

### label?

> `optional` **label**: `string`

Defined in: packages/ui/src/crud/shared/types.ts:34

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`label`](../../../interfaces/CommonDetailFieldProps.md#label)

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: packages/ui/src/crud/shared/types.ts:35

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`labelKey`](../../../interfaces/CommonDetailFieldProps.md#labelkey)

***

### labelPosition?

> `optional` **labelPosition**: `"hidden"` \| `"top"` \| `"left"`

Defined in: packages/ui/src/crud/shared/types.ts:5

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`labelPosition`](../../../interfaces/FieldVariant.md#labelposition)

***

### size?

> `optional` **size**: `"sm"` \| `"md"` \| `"lg"`

Defined in: packages/ui/src/crud/shared/types.ts:6

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### value

> **value**: `T`

Defined in: packages/ui/src/fields/detail/badge-field.tsx:15

The current status/category value (used for variant lookup).

***

### variants

> **variants**: `Record`\<`T`, `BadgeVariant`\>

Defined in: packages/ui/src/fields/detail/badge-field.tsx:19

Mapping from value to badge variant for visual differentiation.
