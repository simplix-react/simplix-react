[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TreeNodeMetadata

# Interface: TreeNodeMetadata

Defined in: [packages/ui/src/crud/tree/tree-types.ts:8](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L8)

Internal metadata injected into flattened tree rows for rendering.

## Remarks

These fields are added by `treeToFlat()` and consumed by `CrudTree.Table`
to render indentation, expand/collapse chevrons, and loading states.

## Properties

### \_hasChildren

> **\_hasChildren**: `boolean`

Defined in: [packages/ui/src/crud/tree/tree-types.ts:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L12)

Whether this node has children.

***

### \_isExpanded

> **\_isExpanded**: `boolean`

Defined in: [packages/ui/src/crud/tree/tree-types.ts:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L14)

Whether this node is currently expanded.

***

### \_isLoading?

> `optional` **\_isLoading**: `boolean`

Defined in: [packages/ui/src/crud/tree/tree-types.ts:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L16)

Whether this node's children are loading (for lazy loading).

***

### \_treeDepth

> **\_treeDepth**: `number`

Defined in: [packages/ui/src/crud/tree/tree-types.ts:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L10)

Nesting depth (0 = root).
