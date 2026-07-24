[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / DateTimeFieldProps

# Interface: DateTimeFieldProps

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L13)

Props for the [DateTimeField](../functions/DateTimeField.md) form component.

## Extends

- [`CommonFieldProps`](../../../interfaces/CommonFieldProps.md)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L49)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`className`](../../../interfaces/CommonFieldProps.md#classname)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:34](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L34)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`description`](../../../interfaces/CommonFieldProps.md#description)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L36)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`disabled`](../../../interfaces/CommonFieldProps.md#disabled)

***

### displayZone?

> `optional` **displayZone**: `string`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:44](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L44)

IANA display timezone for a site-scoped `Instant` field. When set, the
incoming server string is decoded into the site's wall clock and the emitted
value is tagged (via `asZonedInstant`) so `JSON.stringify` re-encodes it in
this zone. The consumer must NOT `toISOString()` the resulting floating Date.
Ignored when [DateTimeFieldProps.hideTime](#hidetime) is set (date-only mode is
zone-neutral; use `DateField` for a calendar date).

***

### displayZoneLabel?

> `optional` **displayZoneLabel**: `ReactNode`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:46](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L46)

Optional label shown under the picker, e.g. "Site time · Asia/Seoul". Defaults to the IANA id.

***

### endYear?

> `optional` **endYear**: `number`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L29)

End year for the year dropdown.

***

### error?

> `optional` **error**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:32](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L32)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`error`](../../../interfaces/CommonFieldProps.md#error)

***

### hideTime?

> `optional` **hideTime**: `boolean`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:31](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L31)

Hide time selection and act as date-only picker.

#### Default Value

```ts
false
```

***

### hour12?

> `optional` **hour12**: `boolean`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L33)

Use a 12-hour clock with an AM/PM toggle.

#### Default Value

```ts
true
```

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L30)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`label`](../../../interfaces/CommonFieldProps.md#label)

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:31](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L31)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`labelKey`](../../../interfaces/CommonFieldProps.md#labelkey)

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

### locale?

> `optional` **locale**: `string`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L23)

Short locale code (e.g. `"ko"`, `"en"`, `"ja"`).

***

### maxDate?

> `optional` **maxDate**: `Date`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L21)

Latest selectable date.

***

### minDate?

> `optional` **minDate**: `Date`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L19)

Earliest selectable date.

***

### minuteStep?

> `optional` **minuteStep**: `number`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L35)

Interval between minute options in the scroll column.

#### Default Value

```ts
1
```

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L17)

Called when the date-time changes.

#### Parameters

##### value

`Date` | `null`

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:25](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L25)

Placeholder text when no date is selected.

***

### prefixControl?

> `optional` **prefixControl**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/types.ts:41](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L41)

Control rendered on the leading (left in LTR) side of the input, on the
same row. Use for IconPicker, ColorPicker, or similar adornments.

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`prefixControl`](../../../interfaces/CommonFieldProps.md#prefixcontrol)

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L35)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`required`](../../../interfaces/CommonFieldProps.md#required)

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L13)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### startYear?

> `optional` **startYear**: `number`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L27)

Start year for the year dropdown.

***

### suffixControl?

> `optional` **suffixControl**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/types.ts:48](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L48)

Control rendered on the trailing (right in LTR) side of the input, on the
same row. Use instead of composing a button next to the field — the
control stays aligned with the input while description and error render
below at full width.

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`suffixControl`](../../../interfaces/CommonFieldProps.md#suffixcontrol)

***

### value

> **value**: [`DateLike`](../../../type-aliases/DateLike.md) \| `null`

Defined in: [packages/ui/src/fields/form/datetime-field.tsx:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/datetime-field.tsx#L15)

Currently selected date-time. Accepts Date, ISO string, or unix timestamp.

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L33)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`warning`](../../../interfaces/CommonFieldProps.md#warning)
