[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TreeMultiSelectFieldProps

# Interface: TreeMultiSelectFieldProps\<T\>

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:149](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L149)

Shared props for all form field components.

## Extends

- [`CommonFieldProps`](CommonFieldProps.md)

## Type Parameters

### T

`T`

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L49)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`className`](CommonFieldProps.md#classname)

***

### config?

> `optional` **config**: `Pick`\<[`TreeConfig`](TreeConfig.md)\<`T`\>, `"idField"` \| `"childrenField"`\>

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:156](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L156)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:34](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L34)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`description`](CommonFieldProps.md#description)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L36)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`disabled`](CommonFieldProps.md#disabled)

***

### error?

> `optional` **error**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:32](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L32)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`error`](CommonFieldProps.md#error)

***

### getDisplayName()?

> `optional` **getDisplayName**: (`item`) => `ReactNode`

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:157](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L157)

#### Parameters

##### item

`T`

#### Returns

`ReactNode`

***

### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:155](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L155)

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L30)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`label`](CommonFieldProps.md#label)

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:31](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L31)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`labelKey`](CommonFieldProps.md#labelkey)

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

[`FieldVariant`](FieldVariant.md).[`layout`](FieldVariant.md#layout)

***

### maxCount?

> `optional` **maxCount**: `number`

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:160](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L160)

Maximum number of selections allowed.

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:153](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L153)

Called with the full selection whenever an item is toggled or removed.

#### Parameters

##### value

`string`[]

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:158](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L158)

***

### prefixControl?

> `optional` **prefixControl**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/types.ts:41](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L41)

Control rendered on the leading (left in LTR) side of the input, on the
same row. Use for IconPicker, ColorPicker, or similar adornments.

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`prefixControl`](CommonFieldProps.md#prefixcontrol)

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L35)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`required`](CommonFieldProps.md#required)

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L13)

#### Inherited from

[`FieldVariant`](FieldVariant.md).[`size`](FieldVariant.md#size)

***

### suffixControl?

> `optional` **suffixControl**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/types.ts:48](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L48)

Control rendered on the trailing (right in LTR) side of the input, on the
same row. Use instead of composing a button next to the field — the
control stays aligned with the input while description and error render
below at full width.

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`suffixControl`](CommonFieldProps.md#suffixcontrol)

***

### treeData

> **treeData**: `T`[]

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:154](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L154)

***

### value

> **value**: `string`[]

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:151](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L151)

Currently selected item ids.

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L33)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`warning`](CommonFieldProps.md#warning)
