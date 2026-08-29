[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / SelectFieldProps

# Interface: SelectFieldProps\<T\>

Defined in: [packages/ui/src/fields/form/select-field.tsx:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/select-field.tsx#L10)

Props for the [SelectField](../functions/SelectField.md) form component.

## Extends

- [`CommonFieldProps`](../../../interfaces/CommonFieldProps.md)

## Type Parameters

### T

`T` *extends* `string` = `string`

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L49)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`className`](../../../interfaces/CommonFieldProps.md#classname)

***

### clearable?

> `optional` **clearable**: `boolean`

Defined in: [packages/ui/src/fields/form/select-field.tsx:51](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/select-field.tsx#L51)

Offer an entry that returns the field to unset.

#### Remarks

A select can only ever move from one option to another, so a field the form declares optional
becomes permanent the moment somebody picks a value — the rank they set by mistake cannot be
taken off again, and the only way back is a column the screen does not offer. Pass this on
every select whose value the DTO accepts as absent.

The entry sits at the top of the list, labelled with [clearLabel](#clearlabel) or the framework's own
word for an empty choice, and hands `""` to `onChange`. Radix refuses an item whose value is
the empty string, so a sentinel carries it and is translated back before the caller sees it.

***

### clearLabel?

> `optional` **clearLabel**: `string`

Defined in: [packages/ui/src/fields/form/select-field.tsx:61](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/select-field.tsx#L61)

What the clearing entry reads as.

#### Remarks

Defaults to `placeholder` — the field has already had to name its own empty state for the
trigger, and reading 「선택 안 함」 in the list and 「직위 없음」 on the trigger a moment later
is two words for one state on one control. Only where neither is given does the framework's
generic word stand in.

***

### compact?

> `optional` **compact**: `boolean`

Defined in: [packages/ui/src/fields/form/select-field.tsx:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/select-field.tsx#L30)

Compact mode: renders without FieldWrapper, and sizes itself to its longest option label
using a hidden native `<select>`. That measurement also means `className` never reaches the
rendered element — pass `fill` when the parent has to own the width.

`error` and `description` still render, below the trigger, so a compact field placed in a
table cell reports why a save was refused. `label` becomes the trigger's accessible name;
`required` draws no visible marker here, because compact mode has no label row to draw one
in. A compact field that has to show a required marker gets it from whatever names the
column (`List.Column`'s `required`).

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

### fill?

> `optional` **fill**: `boolean`

Defined in: [packages/ui/src/fields/form/select-field.tsx:37](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/select-field.tsx#L37)

Compact mode only: give the width back to the parent. The hidden measuring `<select>` is
dropped, the field fills its container, and `className` lands on the wrapper — so a grid or
flex cell can size the field instead of the option list doing it. No effect without `compact`;
the non-compact path already passes `className` to the wrapper.

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

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/select-field.tsx:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/select-field.tsx#L15)

Called when the selection changes.

#### Parameters

##### value

`T`

#### Returns

`void`

***

### options

> **options**: `object`[]

Defined in: [packages/ui/src/fields/form/select-field.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/select-field.tsx#L17)

Available options with label/value pairs.

#### disabled?

> `optional` **disabled**: `boolean`

#### icon?

> `optional` **icon**: `ReactNode`

#### label

> **label**: `string`

#### tag?

> `optional` **tag**: `string`

#### value

> **value**: `T`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/fields/form/select-field.tsx:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/select-field.tsx#L18)

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

> **value**: `T`

Defined in: [packages/ui/src/fields/form/select-field.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/select-field.tsx#L13)

Currently selected value.

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L33)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`warning`](../../../interfaces/CommonFieldProps.md#warning)
