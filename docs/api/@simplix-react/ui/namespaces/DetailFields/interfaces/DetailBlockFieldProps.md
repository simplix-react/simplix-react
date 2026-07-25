[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailBlockFieldProps

# Interface: DetailBlockFieldProps

Defined in: [packages/ui/src/fields/detail/block-field.tsx:8](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/block-field.tsx#L8)

Props for the [DetailBlockField](../functions/DetailBlockField.md) component.

## Extends

- `Omit`\<[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md), `"layout"`\>

## Properties

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/fields/detail/block-field.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/block-field.tsx#L13)

Rich block content (e.g. a stack of labeled lines). Takes precedence over `value`.

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:56](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L56)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`className`](../../../interfaces/CommonDetailFieldProps.md#classname)

***

### fallback?

> `optional` **fallback**: `string`

Defined in: [packages/ui/src/fields/detail/block-field.tsx:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/block-field.tsx#L15)

Fallback text when there is neither a value nor children. Defaults to the shared no-value badge.

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

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L13)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### value?

> `optional` **value**: `string` \| `null`

Defined in: [packages/ui/src/fields/detail/block-field.tsx:11](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/block-field.tsx#L11)

Plain multi-line text; line breaks are preserved. Ignored when `children` is set.
