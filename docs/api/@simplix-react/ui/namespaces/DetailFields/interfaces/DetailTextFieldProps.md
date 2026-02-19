[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailTextFieldProps

# Interface: DetailTextFieldProps

Defined in: packages/ui/src/fields/detail/text-field.tsx:8

Props for the [DetailTextField](../functions/DetailTextField.md) component.

## Extends

- [`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md)

## Properties

### className?

> `optional` **className**: `string`

Defined in: packages/ui/src/crud/shared/types.ts:36

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`className`](../../../interfaces/CommonDetailFieldProps.md#classname)

***

### copyable?

> `optional` **copyable**: `boolean`

Defined in: packages/ui/src/fields/detail/text-field.tsx:14

Whether to show a copy-to-clipboard button.

***

### fallback?

> `optional` **fallback**: `string`

Defined in: packages/ui/src/fields/detail/text-field.tsx:12

Fallback text when value is null/undefined. Defaults to em-dash.

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

> **value**: `string` \| `null` \| `undefined`

Defined in: packages/ui/src/fields/detail/text-field.tsx:10

Text value to display.
