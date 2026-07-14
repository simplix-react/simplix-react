[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TreeMultiSelectFieldProps

# Interface: TreeMultiSelectFieldProps\<T\>

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:149](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L149)

Shared props for all form field components.

## Extends

- [`CommonFieldProps`](CommonFieldProps.md)

## Type Parameters

### T

`T`

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L30)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`className`](CommonFieldProps.md#classname)

***

### config?

> `optional` **config**: `Pick`\<[`TreeConfig`](TreeConfig.md)\<`T`\>, `"idField"` \| `"childrenField"`\>

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:156](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L156)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L27)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`description`](CommonFieldProps.md#description)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L29)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`disabled`](CommonFieldProps.md#disabled)

***

### error?

> `optional` **error**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:25](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L25)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`error`](CommonFieldProps.md#error)

***

### getDisplayName()?

> `optional` **getDisplayName**: (`item`) => `ReactNode`

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:157](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L157)

#### Parameters

##### item

`T`

#### Returns

`ReactNode`

***

### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:155](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L155)

***

### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L23)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`label`](CommonFieldProps.md#label)

***

### labelKey?

> `optional` **labelKey**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L24)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`labelKey`](CommonFieldProps.md#labelkey)

***

### layout?

> `optional` **layout**: `"inline"` \| `"left"` \| `"top"` \| `"hidden"`

Defined in: [packages/ui/src/crud/shared/types.ts:5](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L5)

#### Inherited from

[`FieldVariant`](FieldVariant.md).[`layout`](FieldVariant.md#layout)

***

### maxCount?

> `optional` **maxCount**: `number`

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:160](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L160)

Maximum number of selections allowed.

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:153](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L153)

Called with the full selection whenever an item is toggled or removed.

#### Parameters

##### value

`string`[]

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:158](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L158)

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L28)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`required`](CommonFieldProps.md#required)

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/shared/types.ts:6](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L6)

#### Inherited from

[`FieldVariant`](FieldVariant.md).[`size`](FieldVariant.md#size)

***

### treeData

> **treeData**: `T`[]

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:154](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L154)

***

### value

> **value**: `string`[]

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:151](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L151)

Currently selected item ids.

***

### warning?

> `optional` **warning**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L26)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`warning`](CommonFieldProps.md#warning)
