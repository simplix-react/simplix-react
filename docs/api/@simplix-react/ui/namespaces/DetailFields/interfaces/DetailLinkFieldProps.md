[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailLinkFieldProps

# Interface: DetailLinkFieldProps

Defined in: [packages/ui/src/fields/detail/link-field.tsx:5](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/link-field.tsx#L5)

Props for the [DetailLinkField](../functions/DetailLinkField.md) component.

## Extends

- [`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:56](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L56)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`className`](../../../interfaces/CommonDetailFieldProps.md#classname)

***

### external?

> `optional` **external**: `boolean`

Defined in: [packages/ui/src/fields/detail/link-field.tsx:11](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/link-field.tsx#L11)

Whether the link opens in a new tab with `rel="noopener noreferrer"`.

***

### fallback?

> `optional` **fallback**: `string`

Defined in: [packages/ui/src/fields/detail/link-field.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/link-field.tsx#L13)

Fallback text when value is null, undefined, or empty string. Defaults to em-dash.

***

### href

> **href**: `string` \| `null` \| `undefined`

Defined in: [packages/ui/src/fields/detail/link-field.tsx:9](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/link-field.tsx#L9)

Link URL.

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

Defined in: [packages/ui/src/fields/detail/link-field.tsx:7](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/link-field.tsx#L7)

Display text for the link.
