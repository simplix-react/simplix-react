[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / NumberFieldProps

# Interface: NumberFieldProps

Defined in: packages/ui/src/fields/form/number-field.tsx:7

Props for the [NumberField](../functions/NumberField.md) form component.

## Extends

- [`CommonFieldProps`](../../../interfaces/CommonFieldProps.md)

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

### error?

> `optional` **error**: `string`

Defined in: packages/ui/src/crud/shared/types.ts:25

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`error`](../../../interfaces/CommonFieldProps.md#error)

***

### inputProps?

> `optional` **inputProps**: `DetailedHTMLProps`\<`InputHTMLAttributes`\<`HTMLInputElement`\>, `HTMLInputElement`\>

Defined in: packages/ui/src/fields/form/number-field.tsx:17

Additional props forwarded to the underlying input element.

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

### max?

> `optional` **max**: `number`

Defined in: packages/ui/src/fields/form/number-field.tsx:13

***

### min?

> `optional` **min**: `number`

Defined in: packages/ui/src/fields/form/number-field.tsx:12

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: packages/ui/src/fields/form/number-field.tsx:11

Called when the value changes. Receives `null` when input is cleared.

#### Parameters

##### value

`number` | `null`

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: packages/ui/src/fields/form/number-field.tsx:15

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

### step?

> `optional` **step**: `number`

Defined in: packages/ui/src/fields/form/number-field.tsx:14

***

### value

> **value**: `number` \| `null`

Defined in: packages/ui/src/fields/form/number-field.tsx:9

Current numeric value, or `null` when empty.
