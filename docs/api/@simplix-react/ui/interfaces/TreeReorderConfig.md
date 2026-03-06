[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TreeReorderConfig

# Interface: TreeReorderConfig\<T\>

Defined in: [packages/ui/src/crud/tree/tree-types.ts:40](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L40)

Configuration for drag-and-drop reordering within a tree level.

## Type Parameters

### T

`T`

Tree node data type.

## Properties

### idField?

> `optional` **idField**: keyof `T` & `string`

Defined in: [packages/ui/src/crud/tree/tree-types.ts:44](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L44)

Field name for node ID. Defaults to `"id"`.

***

### onReorder()

> **onReorder**: (`parentId`, `items`) => `void` \| `Promise`\<`void`\>

Defined in: [packages/ui/src/crud/tree/tree-types.ts:46](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L46)

Called after reorder with the parent ID and reordered sibling items.

#### Parameters

##### parentId

`string` | `null`

##### items

`T`[]

#### Returns

`void` \| `Promise`\<`void`\>

***

### orderField

> **orderField**: keyof `T` & `string`

Defined in: [packages/ui/src/crud/tree/tree-types.ts:42](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L42)

Field name for sort order (e.g. `"displayOrder"`).
