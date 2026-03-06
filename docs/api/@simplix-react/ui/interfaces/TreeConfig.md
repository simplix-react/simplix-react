[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TreeConfig

# Interface: TreeConfig\<T\>

Defined in: [packages/ui/src/crud/tree/tree-types.ts:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L24)

Configuration for tree data structure mapping.

## Type Parameters

### T

`T`

Tree node data type.

## Properties

### childrenField?

> `optional` **childrenField**: keyof `T` & `string`

Defined in: [packages/ui/src/crud/tree/tree-types.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L30)

Field name for nested children array. Defaults to `"children"`.

***

### idField?

> `optional` **idField**: keyof `T` & `string`

Defined in: [packages/ui/src/crud/tree/tree-types.ts:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L26)

Field name for node ID. Defaults to `"id"`.

***

### initialExpandedDepth?

> `optional` **initialExpandedDepth**: `number`

Defined in: [packages/ui/src/crud/tree/tree-types.ts:32](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L32)

Number of levels to expand initially. Defaults to `1`.

***

### parentIdField?

> `optional` **parentIdField**: keyof `T` & `string`

Defined in: [packages/ui/src/crud/tree/tree-types.ts:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/tree-types.ts#L28)

Field name for parent ID (flat-list mode).
