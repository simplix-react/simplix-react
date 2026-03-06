[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / isValidCoord

# Function: isValidCoord()

> **isValidCoord**\<`T`\>(`item`): `item is WithValidCoords<T>`

Defined in: [packages/ui/src/utils/geo.ts:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/utils/geo.ts#L14)

Type guard that narrows items to those with valid latitude/longitude.
Rejects null/undefined, (0,0), and out-of-range values.

## Type Parameters

### T

`T` *extends* [`HasCoords`](../interfaces/HasCoords.md)

## Parameters

### item

`T`

## Returns

`item is WithValidCoords<T>`
