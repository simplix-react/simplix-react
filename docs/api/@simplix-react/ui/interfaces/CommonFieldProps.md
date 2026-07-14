[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CommonFieldProps

# Interface: CommonFieldProps

Defined in: [packages/ui/src/crud/shared/types.ts:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L29)

Shared props for all form field components.

## Extends

- `Partial`\<[`FieldVariant`](FieldVariant.md)\>

## Extended by

- [`TreeSelectFieldProps`](TreeSelectFieldProps.md)
- [`TreeMultiSelectFieldProps`](TreeMultiSelectFieldProps.md)
- [`IconFieldProps`](IconFieldProps.md)
- [`GroupedToggleFieldProps`](GroupedToggleFieldProps.md)
- [`CheckboxFieldProps`](../namespaces/FormFields/interfaces/CheckboxFieldProps.md)
- [`ColorFieldProps`](../namespaces/FormFields/interfaces/ColorFieldProps.md)
- [`ComboboxFieldProps`](../namespaces/FormFields/interfaces/ComboboxFieldProps.md)
- [`CountryFieldProps`](../namespaces/FormFields/interfaces/CountryFieldProps.md)
- [`DateFieldProps`](../namespaces/FormFields/interfaces/DateFieldProps.md)
- [`DateRangeFieldProps`](../namespaces/FormFields/interfaces/DateRangeFieldProps.md)
- [`DateTimeFieldProps`](../namespaces/FormFields/interfaces/DateTimeFieldProps.md)
- [`FormFieldProps`](../namespaces/FormFields/interfaces/FormFieldProps.md)
- [`MultiSelectFieldProps`](../namespaces/FormFields/interfaces/MultiSelectFieldProps.md)
- [`NumberFieldProps`](../namespaces/FormFields/interfaces/NumberFieldProps.md)
- [`PasswordFieldProps`](../namespaces/FormFields/interfaces/PasswordFieldProps.md)
- [`PhoneFieldProps`](../namespaces/FormFields/interfaces/PhoneFieldProps.md)
- [`RadioGroupFieldProps`](../namespaces/FormFields/interfaces/RadioGroupFieldProps.md)
- [`SelectFieldProps`](../namespaces/FormFields/interfaces/SelectFieldProps.md)
- [`SliderFieldProps`](../namespaces/FormFields/interfaces/SliderFieldProps.md)
- [`StaticFieldProps`](../namespaces/FormFields/interfaces/StaticFieldProps.md)
- [`SwitchFieldProps`](../namespaces/FormFields/interfaces/SwitchFieldProps.md)
- [`TextFieldProps`](../namespaces/FormFields/interfaces/TextFieldProps.md)
- [`TextareaFieldProps`](../namespaces/FormFields/interfaces/TextareaFieldProps.md)
- [`LocationPickerFieldProps`](../namespaces/FormFields/interfaces/LocationPickerFieldProps.md)
- [`TimeFieldProps`](../namespaces/FormFields/interfaces/TimeFieldProps.md)
- [`TimezoneFieldProps`](../namespaces/FormFields/interfaces/TimezoneFieldProps.md)
- [`I18nTextFieldProps`](../namespaces/FormFields/interfaces/I18nTextFieldProps.md)
- [`I18nTextareaFieldProps`](../namespaces/FormFields/interfaces/I18nTextareaFieldProps.md)
- [`PlateEditorFieldProps`](../namespaces/FormFields/interfaces/PlateEditorFieldProps.md)
- [`PlateEditorI18nFieldProps`](../namespaces/FormFields/interfaces/PlateEditorI18nFieldProps.md)
- [`FileFieldProps`](../namespaces/FormFields/interfaces/FileFieldProps.md)
- [`ImageFieldProps`](../namespaces/FormFields/interfaces/ImageFieldProps.md)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L49)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:34](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L34)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L36)

***

### error?

> `optional` **error**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:32](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L32)

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L30)

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:31](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L31)

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

### prefixControl?

> `optional` **prefixControl**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/types.ts:41](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L41)

Control rendered on the leading (left in LTR) side of the input, on the
same row. Use for IconPicker, ColorPicker, or similar adornments.

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L35)

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

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L33)
