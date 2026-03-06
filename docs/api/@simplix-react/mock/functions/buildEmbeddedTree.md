[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / buildEmbeddedTree

# Function: buildEmbeddedTree()

> **buildEmbeddedTree**\<`T`\>(`rows`, `identityField?`, `parentField?`): `T` & `object`[]

Defined in: [tree-builder.ts:28](https://github.com/simplix-react/simplix-react/blob/main/tree-builder.ts#L28)

Converts flat database rows into a recursive embedded tree structure.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### rows

`T`[]

Flat array of entity data rows.

### identityField?

`string` = `"id"`

The field name used as the node identifier. Defaults to `"id"`.

### parentField?

`string` = `"parentId"`

The field name used as the parent reference. Defaults to `"parentId"`.

## Returns

`T` & `object`[]

Array of root-level nodes, each augmented with a `children` array.

## Remarks

Unlike [buildTreeFromFlatRows](buildTreeFromFlatRows.md), this function embeds `children` directly
into each row object rather than wrapping rows in a `TreeNode` envelope.
Rows with `null`/`undefined` parent or orphaned parent references become root nodes.

## Example

```ts
import { buildEmbeddedTree } from "@simplix-react/mock";

const rows = [
  { id: "1", name: "Root", parentId: null },
  { id: "2", name: "Child", parentId: "1" },
];
const tree = buildEmbeddedTree(rows);
// [{ id: "1", name: "Root", parentId: null, children: [{ id: "2", ... }] }]
```
