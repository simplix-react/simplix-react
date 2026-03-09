[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / DateTimeFieldProps

# Interface: DateTimeFieldProps

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L12)

Props for the [DateTimeField](../functions/DateTimeField.md) form component.

## Extends

- [`CommonFieldProps`](../../../interfaces/CommonFieldProps.md)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L30)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`className`](../../../interfaces/CommonFieldProps.md#classname)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L27)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`description`](../../../interfaces/CommonFieldProps.md#description)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L29)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`disabled`](../../../interfaces/CommonFieldProps.md#disabled)

***

### endYear?

> `optional` **endYear**: `number`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L28)

End year for the year dropdown.

***

### error?

> `optional` **error**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:25](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L25)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`error`](../../../interfaces/CommonFieldProps.md#error)

***

### hideTime?

> `optional` **hideTime**: `boolean`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L30)

Hide time inputs and act as date-only picker.

#### Default Value

```ts
false
```

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L23)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`label`](../../../interfaces/CommonFieldProps.md#label)

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L24)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`labelKey`](../../../interfaces/CommonFieldProps.md#labelkey)

***

### layout?

> `optional` **layout**: `"hidden"` \| `"inline"` \| `"left"` \| `"top"`

Defined in: [packages/ui/src/crud/shared/types.ts:5](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L5)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`layout`](../../../interfaces/FieldVariant.md#layout)

***

### locale?

> `optional` **locale**: `string`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L22)

Short locale code (e.g. `"ko"`, `"en"`, `"ja"`).

***

### maxDate?

> `optional` **maxDate**: `Date`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L20)

Latest selectable date.

***

### minDate?

> `optional` **minDate**: `Date`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L18)

Earliest selectable date.

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L16)

Called when the date-time changes.

#### Parameters

##### value

`Date` | `null`

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L24)

Placeholder text when no date is selected.

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L28)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`required`](../../../interfaces/CommonFieldProps.md#required)

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:6](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L6)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### startYear?

> `optional` **startYear**: `number`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L26)

Start year for the year dropdown.

***

### value

> **value**: [`DateLike`](../../../type-aliases/DateLike.md) \| `null`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L14)

Currently selected date-time. Accepts Date, ISO string, or unix timestamp.

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L26)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`warning`](../../../interfaces/CommonFieldProps.md#warning)
