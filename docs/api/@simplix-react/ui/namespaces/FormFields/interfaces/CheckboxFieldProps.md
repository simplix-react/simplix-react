[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / CheckboxFieldProps

# Interface: CheckboxFieldProps

Defined in: [packages/ui/src/fields/form/checkbox-field.tsx:9](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/fields/form/checkbox-field.tsx#L9)

Props for the [CheckboxField](../functions/CheckboxField.md) form component.

## Extends

- [`CommonFieldProps`](../../../interfaces/CommonFieldProps.md)

## Properties

### checkboxProps?

> `optional` **checkboxProps**: `Omit`\<`CheckboxProps` & `RefAttributes`\<`HTMLButtonElement`\>, `"ref"`\> & `RefAttributes`\<`HTMLButtonElement`\>

Defined in: [packages/ui/src/fields/form/checkbox-field.tsx:15](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/fields/form/checkbox-field.tsx#L15)

Additional props forwarded to the underlying Checkbox element.

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:29](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/shared/types.ts#L29)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`className`](../../../interfaces/CommonFieldProps.md#classname)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:26](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/shared/types.ts#L26)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`description`](../../../interfaces/CommonFieldProps.md#description)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:28](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/shared/types.ts#L28)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`disabled`](../../../interfaces/CommonFieldProps.md#disabled)

***

### error?

> `optional` **error**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:25](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/shared/types.ts#L25)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`error`](../../../interfaces/CommonFieldProps.md#error)

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:23](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/shared/types.ts#L23)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`label`](../../../interfaces/CommonFieldProps.md#label)

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:24](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/shared/types.ts#L24)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`labelKey`](../../../interfaces/CommonFieldProps.md#labelkey)

***

### labelPosition?

> `optional` **labelPosition**: `"hidden"` \| `"top"` \| `"left"`

Defined in: [packages/ui/src/crud/shared/types.ts:5](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/shared/types.ts#L5)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`labelPosition`](../../../interfaces/FieldVariant.md#labelposition)

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/checkbox-field.tsx:13](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/fields/form/checkbox-field.tsx#L13)

Called when the checked state changes.

#### Parameters

##### value

`boolean`

#### Returns

`void`

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:27](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/shared/types.ts#L27)

#### Inherited from

[`CommonFieldProps`](../../../interfaces/CommonFieldProps.md).[`required`](../../../interfaces/CommonFieldProps.md#required)

***

### size?

> `optional` **size**: `"lg"` \| `"md"` \| `"sm"`

Defined in: [packages/ui/src/crud/shared/types.ts:6](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/shared/types.ts#L6)

#### Inherited from

[`FieldVariant`](../../../interfaces/FieldVariant.md).[`size`](../../../interfaces/FieldVariant.md#size)

***

### value

> **value**: `boolean`

Defined in: [packages/ui/src/fields/form/checkbox-field.tsx:11](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/fields/form/checkbox-field.tsx#L11)

Current checked state.
