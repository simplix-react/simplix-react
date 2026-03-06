[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useTreeExpansion

# Function: useTreeExpansion()

> **useTreeExpansion**\<`T`\>(`options`): [`UseTreeExpansionResult`](../interfaces/UseTreeExpansionResult.md)

Defined in: [packages/ui/src/crud/tree/use-tree-expansion.ts:51](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/use-tree-expansion.ts#L51)

Manage expand/collapse state for a tree data structure.

## Type Parameters

### T

`T`

Tree node data type.

## Parameters

### options

`UseTreeExpansionOptions`\<`T`\>

Tree data and configuration.

## Returns

[`UseTreeExpansionResult`](../interfaces/UseTreeExpansionResult.md)

Expansion state and control functions.

## Remarks

Initializes with nodes expanded up to `config.initialExpandedDepth` (default 1).
Provides `expandAll`, `collapseAll`, and `expandToNode` for programmatic control.

## Example

```ts
const { expandedIds, toggleExpand, expandAll } = useTreeExpansion({
  data: categories,
  config: { idField: "id", childrenField: "children" },
});
```
