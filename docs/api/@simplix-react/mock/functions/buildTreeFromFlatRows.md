[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / buildTreeFromFlatRows

# Function: buildTreeFromFlatRows()

> **buildTreeFromFlatRows**\<`T`\>(`rows`, `identityField?`): `TreeNode`\<`T`\>[]

Defined in: tree-builder.ts:23

Converts flat database rows into a recursive tree structure.

Expects each row to have an identity field and a `parentId` field.
Rows with `null` parentId become root nodes.

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `unknown`\>

## Parameters

### rows

`T`[]

Flat array of entity data rows.

### identityField?

`string` = `"id"`

The field name used as the node identifier. Defaults to `"id"`.

## Returns

`TreeNode`\<`T`\>[]

Array of root-level tree nodes with nested children.

## Example

```ts
const rows = [
  { id: "1", name: "Root", parentId: null },
  { id: "2", name: "Child", parentId: "1" },
];
const tree = buildTreeFromFlatRows(rows);
// [{ data: { id: "1", ... }, children: [{ data: { id: "2", ... }, children: [] }] }]
```
