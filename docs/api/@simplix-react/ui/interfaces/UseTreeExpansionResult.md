[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseTreeExpansionResult

# Interface: UseTreeExpansionResult

Defined in: [packages/ui/src/crud/tree/use-tree-expansion.ts:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/use-tree-expansion.ts#L17)

Return value of the [useTreeExpansion](../functions/useTreeExpansion.md) hook.

## Properties

### collapseAll()

> **collapseAll**: () => `void`

Defined in: [packages/ui/src/crud/tree/use-tree-expansion.ts:25](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/use-tree-expansion.ts#L25)

Collapse all nodes in the tree.

#### Returns

`void`

***

### expandAll()

> **expandAll**: () => `void`

Defined in: [packages/ui/src/crud/tree/use-tree-expansion.ts:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/use-tree-expansion.ts#L23)

Expand all nodes in the tree.

#### Returns

`void`

***

### expandedIds

> **expandedIds**: `Set`\<`string`\>

Defined in: [packages/ui/src/crud/tree/use-tree-expansion.ts:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/use-tree-expansion.ts#L19)

Set of currently expanded node IDs.

***

### expandToNode()

> **expandToNode**: (`id`) => `void`

Defined in: [packages/ui/src/crud/tree/use-tree-expansion.ts:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/use-tree-expansion.ts#L29)

Expand all ancestor nodes to reveal a specific node.

#### Parameters

##### id

`string`

#### Returns

`void`

***

### isExpanded()

> **isExpanded**: (`id`) => `boolean`

Defined in: [packages/ui/src/crud/tree/use-tree-expansion.ts:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/use-tree-expansion.ts#L27)

Check whether a specific node is expanded.

#### Parameters

##### id

`string`

#### Returns

`boolean`

***

### toggleExpand()

> **toggleExpand**: (`id`) => `void`

Defined in: [packages/ui/src/crud/tree/use-tree-expansion.ts:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/use-tree-expansion.ts#L21)

Toggle a single node between expanded/collapsed.

#### Parameters

##### id

`string`

#### Returns

`void`
