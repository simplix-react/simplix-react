[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CommonDetailFieldProps

# Interface: CommonDetailFieldProps

Defined in: [packages/ui/src/crud/shared/types.ts:53](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L53)

Shared props for all detail (read-only) field components.

## Extends

- `Partial`\<[`FieldVariant`](FieldVariant.md)\>

## Extended by

- [`DetailBadgeFieldProps`](../namespaces/DetailFields/interfaces/DetailBadgeFieldProps.md)
- [`DetailBooleanFieldProps`](../namespaces/DetailFields/interfaces/DetailBooleanFieldProps.md)
- [`DetailCountryFieldProps`](../namespaces/DetailFields/interfaces/DetailCountryFieldProps.md)
- [`DetailDateFieldProps`](../namespaces/DetailFields/interfaces/DetailDateFieldProps.md)
- [`DetailFieldProps`](../namespaces/DetailFields/interfaces/DetailFieldProps.md)
- [`DetailImageFieldProps`](../namespaces/DetailFields/interfaces/DetailImageFieldProps.md)
- [`DetailLinkFieldProps`](../namespaces/DetailFields/interfaces/DetailLinkFieldProps.md)
- [`DetailLocationFieldProps`](../namespaces/DetailFields/interfaces/DetailLocationFieldProps.md)
- [`DetailListFieldProps`](../namespaces/DetailFields/interfaces/DetailListFieldProps.md)
- [`DetailNumberFieldProps`](../namespaces/DetailFields/interfaces/DetailNumberFieldProps.md)
- [`DetailStatusFieldProps`](../namespaces/DetailFields/interfaces/DetailStatusFieldProps.md)
- [`DetailTextFieldProps`](../namespaces/DetailFields/interfaces/DetailTextFieldProps.md)
- [`DetailTextareaFieldProps`](../namespaces/DetailFields/interfaces/DetailTextareaFieldProps.md)
- [`DetailTimezoneFieldProps`](../namespaces/DetailFields/interfaces/DetailTimezoneFieldProps.md)
- [`DetailI18nTextFieldProps`](../namespaces/DetailFields/interfaces/DetailI18nTextFieldProps.md)
- [`DetailI18nTextareaFieldProps`](../namespaces/DetailFields/interfaces/DetailI18nTextareaFieldProps.md)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:56](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L56)

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:54](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L54)

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:55](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L55)

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

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L13)

#### Inherited from

[`FieldVariant`](FieldVariant.md).[`size`](FieldVariant.md#size)
