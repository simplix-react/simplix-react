[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailBooleanFieldProps

# Interface: DetailBooleanFieldProps

Defined in: [packages/ui/src/fields/detail/boolean-field.tsx:8](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/boolean-field.tsx#L8)

Props for the [DetailBooleanField](../functions/DetailBooleanField.md) component.

## Extends

- [`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:56](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L56)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`className`](../../../interfaces/CommonDetailFieldProps.md#classname)

***

### fallback?

> `optional` **fallback**: `string`

Defined in: [packages/ui/src/fields/detail/boolean-field.tsx:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/boolean-field.tsx#L16)

Fallback text when value is null or undefined. Defaults to em-dash.

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

### labels?

> `optional` **labels**: `object`

Defined in: [packages/ui/src/fields/detail/boolean-field.tsx:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/boolean-field.tsx#L14)

Custom labels for true/false values when using `"text"` mode.

#### false

> **false**: `string`

#### true

> **true**: `string`

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

### mode?

> `optional` **mode**: [`BooleanDisplayMode`](../type-aliases/BooleanDisplayMode.md)

Defined in: [packages/ui/src/fields/detail/boolean-field.tsx:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/boolean-field.tsx#L12)

Display mode: `"text"` shows Yes/No, `"icon"` shows check/x icons. Defaults to `"text"`.

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L13)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### value

> **value**: `boolean` \| `null` \| `undefined`

Defined in: [packages/ui/src/fields/detail/boolean-field.tsx:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/boolean-field.tsx#L10)

Boolean value to display.
