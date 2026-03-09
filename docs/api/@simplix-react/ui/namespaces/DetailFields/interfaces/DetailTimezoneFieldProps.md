[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailTimezoneFieldProps

# Interface: DetailTimezoneFieldProps

Defined in: [packages/ui/src/fields/detail/timezone-field.tsx:8](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/timezone-field.tsx#L8)

Props for the [DetailTimezoneField](../functions/DetailTimezoneField.md) component.

## Extends

- [`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:37](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L37)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`className`](../../../interfaces/CommonDetailFieldProps.md#classname)

***

### fallback?

> `optional` **fallback**: `string`

Defined in: [packages/ui/src/fields/detail/timezone-field.tsx:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/timezone-field.tsx#L12)

Fallback text when value is null/undefined. Defaults to em-dash.

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

> `optional` **layout**: `"hidden"` \| `"inline"` \| `"left"` \| `"top"`

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

> **value**: `string` \| `null` \| `undefined`

Defined in: [packages/ui/src/fields/detail/timezone-field.tsx:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/timezone-field.tsx#L10)

IANA timezone ID (e.g. "Asia/Seoul").
