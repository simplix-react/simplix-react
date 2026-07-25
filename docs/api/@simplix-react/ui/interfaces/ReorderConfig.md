[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ReorderConfig

# Interface: ReorderConfig\<T\>

Defined in: [packages/ui/src/crud/shared/types.ts:72](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L72)

Configuration for drag-and-drop row reordering.

## Type Parameters

### T

`T`

## Properties

### canDrag()?

> `optional` **canDrag**: (`row`) => `boolean`

Defined in: [packages/ui/src/crud/shared/types.ts:80](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L80)

Per-row drag gate — return false to disable drag for specific rows.

#### Parameters

##### row

`T`

#### Returns

`boolean`

***

### idField?

> `optional` **idField**: keyof `T` & `string`

Defined in: [packages/ui/src/crud/shared/types.ts:76](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L76)

Field name for row ID (default: "id").

***

### onReorder()

> **onReorder**: (`items`) => `void` \| `Promise`\<`void`\>

Defined in: [packages/ui/src/crud/shared/types.ts:78](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L78)

Callback invoked with reordered data after drag ends.

#### Parameters

##### items

`T`[]

#### Returns

`void` \| `Promise`\<`void`\>

***

### orderField

> **orderField**: keyof `T` & `string`

Defined in: [packages/ui/src/crud/shared/types.ts:74](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/types.ts#L74)

Field name used for ordering (e.g. "displayOrder", "sortOrder").
