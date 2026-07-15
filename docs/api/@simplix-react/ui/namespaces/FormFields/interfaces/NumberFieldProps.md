[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / NumberFieldProps

# Interface: NumberFieldProps

Defined in: [packages/ui/src/fields/form/number-field.tsx:7](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/number-field.tsx#L7)

Props for the [NumberField](../functions/NumberField.md) form component.

## Extends

- [`CommonFieldProps`](../../../interfaces/CommonFieldProps.md)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L49)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`className`](../../../interfaces/CommonFieldProps.md#classname)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:34](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L34)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`description`](../../../interfaces/CommonFieldProps.md#description)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L36)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`disabled`](../../../interfaces/CommonFieldProps.md#disabled)

***

### error?

> `optional` **error**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:32](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L32)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`error`](../../../interfaces/CommonFieldProps.md#error)

***

### inputProps?

> `optional` **inputProps**: `Omit`\<`DetailedHTMLProps`\<`InputHTMLAttributes`\<`HTMLInputElement`\>, `HTMLInputElement`\>, `"value"` \| `"type"` \| `"onChange"`\>

Defined in: [packages/ui/src/fields/form/number-field.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/number-field.tsx#L19)

Additional props forwarded to the underlying input element.

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L30)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`label`](../../../interfaces/CommonFieldProps.md#label)

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:31](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L31)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`labelKey`](../../../interfaces/CommonFieldProps.md#labelkey)

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

### max?

> `optional` **max**: `number`

Defined in: [packages/ui/src/fields/form/number-field.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/number-field.tsx#L13)

***

### min?

> `optional` **min**: `number`

Defined in: [packages/ui/src/fields/form/number-field.tsx:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/number-field.tsx#L12)

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/number-field.tsx:11](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/number-field.tsx#L11)

Called when the value changes. Receives `null` when input is cleared.

#### Parameters

##### value

`number` | `null`

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/fields/form/number-field.tsx:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/number-field.tsx#L15)

***

### prefixControl?

> `optional` **prefixControl**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/types.ts:41](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L41)

Control rendered on the leading (left in LTR) side of the input, on the
same row. Use for IconPicker, ColorPicker, or similar adornments.

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`prefixControl`](../../../interfaces/CommonFieldProps.md#prefixcontrol)

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L35)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`required`](../../../interfaces/CommonFieldProps.md#required)

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L13)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### step?

> `optional` **step**: `number`

Defined in: [packages/ui/src/fields/form/number-field.tsx:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/number-field.tsx#L14)

***

### suffix?

> `optional` **suffix**: `string`

Defined in: [packages/ui/src/fields/form/number-field.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/number-field.tsx#L17)

Unit suffix displayed inside the input (e.g. "sec", "px", "kg").

***

### suffixControl?

> `optional` **suffixControl**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/types.ts:48](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L48)

Control rendered on the trailing (right in LTR) side of the input, on the
same row. Use instead of composing a button next to the field — the
control stays aligned with the input while description and error render
below at full width.

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`suffixControl`](../../../interfaces/CommonFieldProps.md#suffixcontrol)

***

### value

> **value**: `number` \| `null`

Defined in: [packages/ui/src/fields/form/number-field.tsx:9](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/number-field.tsx#L9)

Current numeric value, or `null` when empty.

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L33)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`warning`](../../../interfaces/CommonFieldProps.md#warning)
