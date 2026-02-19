[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / ComboboxFieldProps

# Interface: ComboboxFieldProps\<T\>

Defined in: packages/ui/src/fields/form/combobox-field.tsx:14

Props for the [ComboboxField](../functions/ComboboxField.md) form component.

## Extends

- [`CommonFieldProps`](../../../interfaces/CommonFieldProps.md)

## Type Parameters

### T

`T` *extends* `string` = `string`

## Properties

### className?

> `optional` **className**: `string`

Defined in: packages/ui/src/crud/shared/types.ts:29

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`className`](../../../interfaces/CommonFieldProps.md#classname)

***

### description?

> `optional` **description**: `string`

Defined in: packages/ui/src/crud/shared/types.ts:26

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`description`](../../../interfaces/CommonFieldProps.md#description)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: packages/ui/src/crud/shared/types.ts:28

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`disabled`](../../../interfaces/CommonFieldProps.md#disabled)

***

### emptyMessage?

> `optional` **emptyMessage**: `string`

Defined in: packages/ui/src/fields/form/combobox-field.tsx:22

***

### error?

> `optional` **error**: `string`

Defined in: packages/ui/src/crud/shared/types.ts:25

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`error`](../../../interfaces/CommonFieldProps.md#error)

***

### label?

> `optional` **label**: `string`

Defined in: packages/ui/src/crud/shared/types.ts:23

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`label`](../../../interfaces/CommonFieldProps.md#label)

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: packages/ui/src/crud/shared/types.ts:24

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`labelKey`](../../../interfaces/CommonFieldProps.md#labelkey)

***

### labelPosition?

> `optional` **labelPosition**: `"hidden"` \| `"top"` \| `"left"`

Defined in: packages/ui/src/crud/shared/types.ts:5

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`labelPosition`](../../../interfaces/FieldVariant.md#labelposition)

***

### loading?

> `optional` **loading**: `boolean`

Defined in: packages/ui/src/fields/form/combobox-field.tsx:20

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: packages/ui/src/fields/form/combobox-field.tsx:17

#### Parameters

##### value

`T` | `null`

#### Returns

`void`

***

### onSearch()?

> `optional` **onSearch**: (`query`) => `void`

Defined in: packages/ui/src/fields/form/combobox-field.tsx:19

#### Parameters

##### query

`string`

#### Returns

`void`

***

### options

> **options**: `object`[]

Defined in: packages/ui/src/fields/form/combobox-field.tsx:18

#### label

> **label**: `string`

#### value

> **value**: `T`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: packages/ui/src/fields/form/combobox-field.tsx:21

***

### required?

> `optional` **required**: `boolean`

Defined in: packages/ui/src/crud/shared/types.ts:27

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`required`](../../../interfaces/CommonFieldProps.md#required)

***

### size?

> `optional` **size**: `"sm"` \| `"md"` \| `"lg"`

Defined in: packages/ui/src/crud/shared/types.ts:6

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### value

> **value**: `T` \| `null`

Defined in: packages/ui/src/fields/form/combobox-field.tsx:16
