[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailStatusFieldProps

# Interface: DetailStatusFieldProps

Defined in: [packages/ui/src/fields/detail/status-field.tsx:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/status-field.tsx#L10)

Props for the [DetailStatusField](../functions/DetailStatusField.md) component.

## Extends

- [`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md)

## Properties

### appearance?

> `optional` **appearance**: `"outline"` \| `"filled"`

Defined in: [packages/ui/src/fields/detail/status-field.tsx:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/status-field.tsx#L24)

Pill appearance; defaults to `outline`.

***

### badgeSize?

> `optional` **badgeSize**: `"default"` \| `"xs"` \| `"sm"`

Defined in: [packages/ui/src/fields/detail/status-field.tsx:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/status-field.tsx#L26)

Pill size; defaults to `sm` (detail density).

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:56](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L56)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`className`](../../../interfaces/CommonDetailFieldProps.md#classname)

***

### fallback?

> `optional` **fallback**: `string`

Defined in: [packages/ui/src/fields/detail/status-field.tsx:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/status-field.tsx#L28)

Fallback text when value is null, undefined, or empty string. Defaults to the shared no-value badge.

***

### icon?

> `optional` **icon**: [`IconComponent`](../../../type-aliases/IconComponent.md)

Defined in: [packages/ui/src/fields/detail/status-field.tsx:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/status-field.tsx#L22)

Optional leading icon (mutually exclusive with `showDot`).

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:54](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L54)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`label`](../../../interfaces/CommonDetailFieldProps.md#label)

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:55](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L55)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`labelKey`](../../../interfaces/CommonDetailFieldProps.md#labelkey)

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

### showDot?

> `optional` **showDot**: `boolean`

Defined in: [packages/ui/src/fields/detail/status-field.tsx:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/status-field.tsx#L20)

Render a leading [StatusDot](../../../variables/StatusDot.md) of the same tone (mutually exclusive with `icon`).

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L13)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### tone

> **tone**: [`StatusTone`](../../../type-aliases/StatusTone.md)

Defined in: [packages/ui/src/fields/detail/status-field.tsx:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/status-field.tsx#L16)

Resolved semantic tone for the status pill. Look this up via a shared tone
map (e.g. `@pacs-studio/pacs-ui` `cardholderStatusToTone[value] ?? "neutral"`)
— never hand-write an enum→color map at the call site.

***

### value

> **value**: `ReactNode`

Defined in: [packages/ui/src/fields/detail/status-field.tsx:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/status-field.tsx#L18)

Already-translated status label shown inside the pill.
