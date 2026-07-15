[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / GroupedToggleFieldProps

# Interface: GroupedToggleFieldProps\<T\>

Defined in: [packages/ui/src/fields/form/grouped-toggle-field.tsx:50](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/grouped-toggle-field.tsx#L50)

Props for the [GroupedToggleField](../functions/GroupedToggleField.md) form component.

## Extends

- [`CommonFieldProps`](CommonFieldProps.md)

## Type Parameters

### T

`T` *extends* `string` = `string`

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L49)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`className`](CommonFieldProps.md#classname)

***

### columns?

> `optional` **columns**: `number`

Defined in: [packages/ui/src/fields/form/grouped-toggle-field.tsx:69](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/grouped-toggle-field.tsx#L69)

Number of group columns at the `sm` breakpoint and up.

#### Default Value

```ts
3
```

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

### groups

> **groups**: [`GroupedToggleGroup`](GroupedToggleGroup.md)\<`T`\>[]

Defined in: [packages/ui/src/fields/form/grouped-toggle-field.tsx:57](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/grouped-toggle-field.tsx#L57)

Group definitions rendered as cards.

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

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/grouped-toggle-field.tsx:55](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/grouped-toggle-field.tsx#L55)

Called when the selection changes. Receives the full next record.

#### Parameters

##### value

`Record`\<`string`, `T`[]\>

#### Returns

`void`

***

### prefixControl?

> `optional` **prefixControl**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/types.ts:41](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L41)

Control rendered on the leading (left in LTR) side of the input, on the
same row. Use for IconPicker, ColorPicker, or similar adornments.

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`prefixControl`](CommonFieldProps.md#prefixcontrol)

***

### renderOtherNote()?

> `optional` **renderOtherNote**: (`info`) => `ReactNode`

Defined in: [packages/ui/src/fields/form/grouped-toggle-field.tsx:67](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/grouped-toggle-field.tsx#L67)

Renders a note about selected values that match no option in any group's
catalog. These values are always preserved across toggles and select-all,
so this surfaces externally-registered entries.

#### Parameters

##### info

[`GroupedToggleOtherInfo`](GroupedToggleOtherInfo.md)\<`T`\>

#### Returns

`ReactNode`

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L35)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`required`](CommonFieldProps.md#required)

***

### selectAllLabel

> **selectAllLabel**: `string`

Defined in: [packages/ui/src/fields/form/grouped-toggle-field.tsx:61](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/grouped-toggle-field.tsx#L61)

Label for the select-all switch, resolved by the consumer (already localized).

***

### showSelectAll?

> `optional` **showSelectAll**: `boolean`

Defined in: [packages/ui/src/fields/form/grouped-toggle-field.tsx:59](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/grouped-toggle-field.tsx#L59)

Show the per-group "select all" switch.

#### Default Value

```ts
true
```

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

### value

> **value**: `Record`\<`string`, `T`[]\>

Defined in: [packages/ui/src/fields/form/grouped-toggle-field.tsx:53](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/grouped-toggle-field.tsx#L53)

Selected values keyed by group id.

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L33)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`warning`](CommonFieldProps.md#warning)
