[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailStatusFieldProps

# Interface: DetailStatusFieldProps

Defined in: [packages/ui/src/fields/detail/status-field.tsx:9](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/status-field.tsx#L9)

Props for the [DetailStatusField](../functions/DetailStatusField.md) component.

## Extends

- [`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md)

## Properties

### appearance?

> `optional` **appearance**: `"outline"` \| `"filled"`

Defined in: [packages/ui/src/fields/detail/status-field.tsx:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/status-field.tsx#L23)

Pill appearance; defaults to `outline`.

***

### badgeSize?

> `optional` **badgeSize**: `"default"` \| `"xs"` \| `"sm"`

Defined in: [packages/ui/src/fields/detail/status-field.tsx:25](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/status-field.tsx#L25)

Pill size; defaults to `sm` (detail density).

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:37](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L37)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`className`](../../../interfaces/CommonDetailFieldProps.md#classname)

***

### fallback?

> `optional` **fallback**: `string`

Defined in: [packages/ui/src/fields/detail/status-field.tsx:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/status-field.tsx#L27)

Fallback text when value is null, undefined, or empty string. Defaults to em-dash.

***

### icon?

> `optional` **icon**: [`IconComponent`](../../../type-aliases/IconComponent.md)

Defined in: [packages/ui/src/fields/detail/status-field.tsx:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/status-field.tsx#L21)

Optional leading icon (mutually exclusive with `showDot`).

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L35)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`label`](../../../interfaces/CommonDetailFieldProps.md#label)

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L36)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`labelKey`](../../../interfaces/CommonDetailFieldProps.md#labelkey)

***

### layout?

> `optional` **layout**: `"inline"` \| `"left"` \| `"top"` \| `"hidden"`

Defined in: [packages/ui/src/crud/shared/types.ts:5](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L5)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`layout`](../../../interfaces/FieldVariant.md#layout)

***

### showDot?

> `optional` **showDot**: `boolean`

Defined in: [packages/ui/src/fields/detail/status-field.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/status-field.tsx#L19)

Render a leading [StatusDot](../../../variables/StatusDot.md) of the same tone (mutually exclusive with `icon`).

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:6](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L6)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### tone

> **tone**: [`StatusTone`](../../../type-aliases/StatusTone.md)

Defined in: [packages/ui/src/fields/detail/status-field.tsx:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/status-field.tsx#L15)

Resolved semantic tone for the status pill. Look this up via a shared tone
map (e.g. `@pacs-studio/pacs-ui` `cardholderStatusToTone[value] ?? "neutral"`)
— never hand-write an enum→color map at the call site.

***

### value

> **value**: `ReactNode`

Defined in: [packages/ui/src/fields/detail/status-field.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/status-field.tsx#L17)

Already-translated status label shown inside the pill.
