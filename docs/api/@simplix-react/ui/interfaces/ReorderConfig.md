[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ReorderConfig

# Interface: ReorderConfig\<T\>

Defined in: [packages/ui/src/crud/shared/types.ts:84](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L84)

Configuration for drag-and-drop row reordering.

## Type Parameters

### T

`T`

## Properties

### canDrag()?

> `optional` **canDrag**: (`row`) => `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:92](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L92)

Per-row drag gate — return false to disable drag for specific rows.

#### Parameters

##### row

`T`

#### Returns

`boolean`

***

### idField?

> `optional` **idField**: keyof `T` & `string`

Defined in: [packages/ui/src/crud/shared/types.ts:88](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L88)

Field name for row ID (default: "id").

***

### onReorder()

> **onReorder**: (`items`) => `void` \| `Promise`\<`void`\>

Defined in: [packages/ui/src/crud/shared/types.ts:90](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L90)

Callback invoked with reordered data after drag ends.

#### Parameters

##### items

`T`[]

#### Returns

`void` \| `Promise`\<`void`\>

***

### orderField

> **orderField**: keyof `T` & `string`

Defined in: [packages/ui/src/crud/shared/types.ts:86](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L86)

Field name used for ordering (e.g. "displayOrder", "sortOrder").
