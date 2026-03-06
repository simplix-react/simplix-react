[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailLocationFieldProps

# Interface: DetailLocationFieldProps

Defined in: [packages/ui/src/fields/detail/location-field.tsx:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/location-field.tsx#L18)

Props for the [DetailLocationField](../functions/DetailLocationField.md) component.

## Extends

- [`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L36)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`className`](../../../interfaces/CommonDetailFieldProps.md#classname)

***

### fallback?

> `optional` **fallback**: `string`

Defined in: [packages/ui/src/fields/detail/location-field.tsx:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/location-field.tsx#L23)

Fallback text when coordinates are empty (0,0). Defaults to em-dash.

***

### fallbackTileUrl?

> `optional` **fallbackTileUrl**: `string`

Defined in: [packages/ui/src/fields/detail/location-field.tsx:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/location-field.tsx#L27)

PMTiles file URL for offline map fallback (e.g. "/offline-map.pmtiles").

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:34](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L34)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`label`](../../../interfaces/CommonDetailFieldProps.md#label)

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L35)

#### Inherited from

[`CommonDetailFieldProps`](../../../interfaces/CommonDetailFieldProps.md).[`labelKey`](../../../interfaces/CommonDetailFieldProps.md#labelkey)

***

### latitude

> **latitude**: `number`

Defined in: [packages/ui/src/fields/detail/location-field.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/location-field.tsx#L19)

***

### layout?

> `optional` **layout**: `"hidden"` \| `"inline"` \| `"left"` \| `"top"`

Defined in: [packages/ui/src/crud/shared/types.ts:5](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L5)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`layout`](../../../interfaces/FieldVariant.md#layout)

***

### longitude

> **longitude**: `number`

Defined in: [packages/ui/src/fields/detail/location-field.tsx:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/location-field.tsx#L20)

***

### markerIcon?

> `optional` **markerIcon**: `ReactNode`

Defined in: [packages/ui/src/fields/detail/location-field.tsx:25](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/location-field.tsx#L25)

Custom marker icon. Replaces the default blue dot.

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:6](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L6)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### zoom?

> `optional` **zoom**: `number`

Defined in: [packages/ui/src/fields/detail/location-field.tsx:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/location-field.tsx#L21)
