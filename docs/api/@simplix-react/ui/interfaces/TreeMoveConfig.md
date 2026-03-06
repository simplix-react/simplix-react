[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TreeMoveConfig

# Interface: TreeMoveConfig\<T\>

Defined in: [packages/ui/src/crud/tree/tree-types.ts:54](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L54)

Configuration for moving a node to a different parent in the tree.

## Type Parameters

### T

`T`

Tree node data type.

## Properties

### getDisplayName()

> **getDisplayName**: (`item`) => `string`

Defined in: [packages/ui/src/crud/tree/tree-types.ts:60](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L60)

Extract a display name from a node for the move dialog.

#### Parameters

##### item

`T`

#### Returns

`string`

***

### idField?

> `optional` **idField**: keyof `T` & `string`

Defined in: [packages/ui/src/crud/tree/tree-types.ts:56](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L56)

Field name for node ID. Defaults to `"id"`.

***

### onMove()

> **onMove**: (`itemId`, `newParentId`) => `void` \| `Promise`\<`void`\>

Defined in: [packages/ui/src/crud/tree/tree-types.ts:62](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L62)

Called when the user confirms the move. `null` parent means root level.

#### Parameters

##### itemId

`string`

##### newParentId

`string` | `null`

#### Returns

`void` \| `Promise`\<`void`\>

***

### parentIdField?

> `optional` **parentIdField**: keyof `T` & `string`

Defined in: [packages/ui/src/crud/tree/tree-types.ts:58](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L58)

Field name for parent ID.
