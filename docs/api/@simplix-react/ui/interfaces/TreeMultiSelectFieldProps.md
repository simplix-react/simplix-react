[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TreeMultiSelectFieldProps

# Interface: TreeMultiSelectFieldProps\<T\>

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:246](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L246)

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

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:253](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L253)

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

### getChipLabel()?

> `optional` **getChipLabel**: (`item`) => `ReactNode`

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:274](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L274)

Label for a selected item's chip, when it must differ from its row label. A leaf row sitting
inside its branch can be named `1층`, while the chip that stands alone outside the tree needs
`본관 1층` to stay unambiguous. Defaults to `getDisplayName`.

#### Parameters

##### item

`T`

#### Returns

`ReactNode`

***

### getDisplayName()?

> `optional` **getDisplayName**: (`item`) => `ReactNode`

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:254](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L254)

#### Parameters

##### item

`T`

#### Returns

`ReactNode`

***

### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:252](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L252)

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

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:257](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L257)

Maximum number of selections allowed.

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:250](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L250)

Called with the full selection whenever an item is toggled or removed.

#### Parameters

##### value

`string`[]

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:255](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L255)

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

### selectionMode?

> `optional` **selectionMode**: `"node"` \| `"leaf-cascade"`

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:268](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L268)

Selection mode.

`"node"` (default) — every node selects on its own and its id enters `value`.

`"leaf-cascade"` — only leaf ids enter `value`; a branch renders a tri-state checkbox
computed from the leaves beneath it, and toggling it selects or clears all of them. Use it
where the branch level is a grouping the caller does not store — a building over its floors,
a category over its items.

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

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:251](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L251)

***

### value

> **value**: `string`[]

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:248](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L248)

Currently selected item ids.

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L33)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`warning`](CommonFieldProps.md#warning)
