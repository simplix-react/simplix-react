[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TreeSelectFieldProps

# Interface: TreeSelectFieldProps\<T\>

Defined in: [packages/ui/src/fields/form/tree-select-field.tsx:160](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-select-field.tsx#L160)

Shared props for all form field components.

## Extends

- [`CommonFieldProps`](CommonFieldProps.md)

## Type Parameters

### T

`T`

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L29)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`className`](CommonFieldProps.md#classname)

***

### config?

> `optional` **config**: `Pick`\<[`TreeConfig`](TreeConfig.md)\<`T`\>, `"idField"` \| `"childrenField"`\>

Defined in: [packages/ui/src/fields/form/tree-select-field.tsx:165](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-select-field.tsx#L165)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L26)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`description`](CommonFieldProps.md#description)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L28)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`disabled`](CommonFieldProps.md#disabled)

***

### disabledItemId?

> `optional` **disabledItemId**: `string`

Defined in: [packages/ui/src/fields/form/tree-select-field.tsx:167](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-select-field.tsx#L167)

***

### error?

> `optional` **error**: `string`

Defined in: [packages/ui/src/crud/shared/types.ts:25](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L25)

#### Inherited from

[`CommonFieldProps`](CommonFieldProps.md).[`error`](CommonFieldProps.md#error)

***

### getDisplayName()?

> `optional` **getDisplayName**: (`item`) => `string`

Defined in: [packages/ui/src/fields/form/tree-select-field.tsx:166](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-select-field.tsx#L166)

#### Parameters

##### item

`T`

#### Returns

`string`

***

### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/ui/src/fields/form/tree-select-field.tsx:164](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-select-field.tsx#L164)

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

> `optional` **layout**: `"hidden"` \| `"inline"` \| `"left"` \| `"top"`

Defined in: [packages/ui/src/crud/shared/types.ts:5](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L5)

#### Inherited from

[`FieldVariant`](FieldVariant.md).[`layout`](FieldVariant.md#layout)

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/fields/form/tree-select-field.tsx:162](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-select-field.tsx#L162)

#### Parameters

##### value

`string` | `null`

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/fields/form/tree-select-field.tsx:168](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-select-field.tsx#L168)

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L27)

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

Defined in: [packages/ui/src/fields/form/tree-select-field.tsx:163](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-select-field.tsx#L163)

***

### value

> **value**: `string` \| `null`

Defined in: [packages/ui/src/fields/form/tree-select-field.tsx:161](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-select-field.tsx#L161)
