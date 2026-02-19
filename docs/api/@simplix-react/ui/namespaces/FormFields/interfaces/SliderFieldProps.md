[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / SliderFieldProps

# Interface: SliderFieldProps

Defined in: packages/ui/src/fields/form/slider-field.tsx:6

Props for the [SliderField](../functions/SliderField.md) form component.

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

Defined in: packages/ui/src/fields/form/slider-field.tsx:17

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

Defined in: packages/ui/src/fields/form/slider-field.tsx:12

***

### min?

> `optional` **min**: `number`

Defined in: packages/ui/src/fields/form/slider-field.tsx:11

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: packages/ui/src/fields/form/slider-field.tsx:10

Called when the value changes.

#### Parameters

##### value

`number`

#### Returns

`void`

***

### required?

> `optional` **required**: `boolean`

Defined in: packages/ui/src/crud/shared/types.ts:27

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`required`](../../../interfaces/CommonFieldProps.md#required)

***

### showValue?

> `optional` **showValue**: `boolean`

Defined in: packages/ui/src/fields/form/slider-field.tsx:15

Whether to display the current value next to the slider.

***

### size?

> `optional` **size**: `"sm"` \| `"md"` \| `"lg"`

Defined in: packages/ui/src/crud/shared/types.ts:6

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### step?

> `optional` **step**: `number`

Defined in: packages/ui/src/fields/form/slider-field.tsx:13

***

### value

> **value**: `number`

Defined in: packages/ui/src/fields/form/slider-field.tsx:8

Current slider value.
