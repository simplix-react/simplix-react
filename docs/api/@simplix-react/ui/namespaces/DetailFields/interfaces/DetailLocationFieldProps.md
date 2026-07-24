[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailLocationFieldProps

# Interface: DetailLocationFieldProps

Defined in: [packages/ui/src/fields/detail/location-field.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/location-field.tsx#L19)

Props for the [DetailLocationField](../functions/DetailLocationField.md) component.

## Extends

- [`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:56](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L56)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`className`](../../../interfaces/CommonDetailFieldProps.md#classname)

***

### fallback?

> `optional` **fallback**: `string`

Defined in: [packages/ui/src/fields/detail/location-field.tsx:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/location-field.tsx#L24)

Fallback text when coordinates are empty (0,0). Defaults to the shared no-value badge.

***

### fallbackTileUrl?

> `optional` **fallbackTileUrl**: `string`

Defined in: [packages/ui/src/fields/detail/location-field.tsx:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/location-field.tsx#L30)

PMTiles file URL for offline map fallback (e.g. "/offline-map.pmtiles").

***

### hideWhenEmpty?

> `optional` **hideWhenEmpty**: `boolean`

Defined in: [packages/ui/src/fields/detail/location-field.tsx:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/location-field.tsx#L26)

When true, renders nothing if coordinates are empty. Defaults to false.

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

### latitude

> **latitude**: `number`

Defined in: [packages/ui/src/fields/detail/location-field.tsx:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/location-field.tsx#L20)

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

### longitude

> **longitude**: `number`

Defined in: [packages/ui/src/fields/detail/location-field.tsx:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/location-field.tsx#L21)

***

### markerIcon?

> `optional` **markerIcon**: `ReactNode`

Defined in: [packages/ui/src/fields/detail/location-field.tsx:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/location-field.tsx#L28)

Custom marker icon. Replaces the default blue dot.

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L13)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### zoom?

> `optional` **zoom**: `number`

Defined in: [packages/ui/src/fields/detail/location-field.tsx:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/location-field.tsx#L22)
