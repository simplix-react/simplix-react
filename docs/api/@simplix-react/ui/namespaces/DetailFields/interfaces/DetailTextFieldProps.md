[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailTextFieldProps

# Interface: DetailTextFieldProps

Defined in: [packages/ui/src/fields/detail/text-field.tsx:8](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/text-field.tsx#L8)

Props for the [DetailTextField](../functions/DetailTextField.md) component.

## Extends

- [`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L36)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`className`](../../../interfaces/CommonDetailFieldProps.md#classname)

***

### copyable?

> `optional` **copyable**: `boolean`

Defined in: [packages/ui/src/fields/detail/text-field.tsx:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/text-field.tsx#L14)

Whether to show a copy-to-clipboard button.

***

### fallback?

> `optional` **fallback**: `string`

Defined in: [packages/ui/src/fields/detail/text-field.tsx:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/text-field.tsx#L12)

Fallback text when value is null/undefined. Defaults to em-dash.

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:34](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L34)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`label`](../../../interfaces/CommonDetailFieldProps.md#label)

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L35)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`labelKey`](../../../interfaces/CommonDetailFieldProps.md#labelkey)

***

### labelPosition?

> `optional` **labelPosition**: `"hidden"` \| `"top"` \| `"left"`

Defined in: [packages/ui/src/crud/shared/types.ts:5](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L5)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`labelPosition`](../../../interfaces/FieldVariant.md#labelposition)

***

### size?

> `optional` **size**: `"lg"` \| `"md"` \| `"sm"`

Defined in: [packages/ui/src/crud/shared/types.ts:6](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L6)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### value

> **value**: `string` \| `null` \| `undefined`

Defined in: [packages/ui/src/fields/detail/text-field.tsx:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/text-field.tsx#L10)

Text value to display.
