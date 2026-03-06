[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / buildTreeFromFlatRows

# Function: buildTreeFromFlatRows()

> **buildTreeFromFlatRows**\<`T`\>(`rows`, `identityField?`): `TreeNode`\<`T`\>[]

Defined in: [tree-builder.ts:87](https://github.com/simplix-react/simplix-react/blob/main/tree-builder.ts#L87)

Converts flat database rows into a recursive `TreeNode` structure.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### rows

`T`[]

Flat array of entity data rows. Each row must have a `parentId` field.

### identityField?

`string` = `"id"`

The field name used as the node identifier. Defaults to `"id"`.

## Returns

`TreeNode`\<`T`\>[]

Array of root-level TreeNode instances with nested children.

## Remarks

Each row is wrapped in a `TreeNode<T>` with `data` and `children` fields.
Rows whose `parentId` is `null`/`undefined` or references a missing parent
become root nodes.

## Example

```ts
import { buildTreeFromFlatRows } from "@simplix-react/mock";

const rows = [
  { id: 1, name: "Root", parentId: null },
  { id: 2, name: "Child A", parentId: 1 },
  { id: 3, name: "Child B", parentId: 1 },
];
const tree = buildTreeFromFlatRows(rows);
// [{ data: { id: 1, ... }, children: [{ data: { id: 2, ... } }, { data: { id: 3, ... } }] }]
```
