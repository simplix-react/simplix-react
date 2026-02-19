[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / TreeNode

# Interface: TreeNode\<T\>

Defined in: [packages/contract/src/types.ts:119](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/contract/src/types.ts#L119)

Tree response node wrapping entity data with recursive children.

Used by `tree` role operations to represent hierarchical structures
such as categories, org charts, or folder trees.

## Type Parameters

### T

`T`

The entity data type.

## Properties

### children

> **children**: `TreeNode`\<`T`\>[]

Defined in: [packages/contract/src/types.ts:123](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/contract/src/types.ts#L123)

Child nodes in the hierarchy.

***

### data

> **data**: `T`

Defined in: [packages/contract/src/types.ts:121](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/contract/src/types.ts#L121)

The entity data for this node.
