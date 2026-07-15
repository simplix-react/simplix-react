[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / IconFieldProps

# Interface: IconFieldProps

Defined in: [packages/ui/src/fields/form/icon-field.tsx:7](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/icon-field.tsx#L7)

Props for the [IconField](../functions/IconField.md) form component.

## Extends

- [`CommonFieldProps`](CommonFieldProps.md)

## Properties

### categorized?

> `optional` **categorized**: `boolean`

Defined in: [packages/ui/src/fields/form/icon-field.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/icon-field.tsx#L13)

Show categorized icon browser instead of a random 100 sample.

#### Default Value

```ts
true
```

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L49)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`className`](CommonFieldProps.md#classname)

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

### iconsList?

> `optional` **iconsList**: `object`[]

Defined in: [packages/ui/src/fields/form/icon-field.tsx:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/icon-field.tsx#L15)

Custom icon list to display instead of the built-in catalog.

#### categories

> **categories**: `string`[]

#### name

> **name**: `string`

#### tags

> **tags**: `string`[]

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

### lang?

> `optional` **lang**: `string`

Defined in: [packages/ui/src/fields/form/icon-field.tsx:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/icon-field.tsx#L21)

BCP-47 locale tag for the icon picker UI (e.g. `"ko-KR"`). Defaults to `navigator.language`.

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

### modal?

> `optional` **modal**: `boolean`

Defined in: [packages/ui/src/fields/form/icon-field.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/icon-field.tsx#L19)

Whether the Popover renders in a portal (modal mode).

#### Default Value

```ts
false
```

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/icon-field.tsx:11](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/icon-field.tsx#L11)

Called when the selected icon changes. Pass `""` to clear.

#### Parameters

##### value

`string`

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

### triggerPlaceholder?

> `optional` **triggerPlaceholder**: `string`

Defined in: [packages/ui/src/fields/form/icon-field.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/icon-field.tsx#L17)

Placeholder text shown on the trigger button when no icon is selected.

***

### value

> **value**: `string`

Defined in: [packages/ui/src/fields/form/icon-field.tsx:9](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/icon-field.tsx#L9)

Currently selected icon name (kebab-case, e.g. `"folder"`). Controlled.

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L33)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`warning`](CommonFieldProps.md#warning)
