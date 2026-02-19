[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailNumberFieldProps

# Interface: DetailNumberFieldProps

Defined in: packages/ui/src/fields/detail/number-field.tsx:7

Props for the [DetailNumberField](../functions/DetailNumberField.md) component.

## Extends

- [`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md)

## Properties

### className?

> `optional` **className**: `string`

Defined in: packages/ui/src/crud/shared/types.ts:36

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`className`](../../../interfaces/CommonDetailFieldProps.md#classname)

***

### currency?

> `optional` **currency**: `string`

Defined in: packages/ui/src/fields/detail/number-field.tsx:15

Currency code when `format="currency"` (e.g., `"USD"`).

***

### fallback?

> `optional` **fallback**: `string`

Defined in: packages/ui/src/fields/detail/number-field.tsx:17

Fallback text when value is null. Defaults to em-dash.

***

### format?

> `optional` **format**: `"decimal"` \| `"currency"` \| `"percent"`

Defined in: packages/ui/src/fields/detail/number-field.tsx:11

Number formatting style. Defaults to `"decimal"`.

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

### locale?

> `optional` **locale**: `string`

Defined in: packages/ui/src/fields/detail/number-field.tsx:13

Locale for number formatting (e.g., `"en-US"`).

***

### size?

> `optional` **size**: `"sm"` \| `"md"` \| `"lg"`

Defined in: packages/ui/src/crud/shared/types.ts:6

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### value

> **value**: `number` \| `null`

Defined in: packages/ui/src/fields/detail/number-field.tsx:9

Numeric value to display.
