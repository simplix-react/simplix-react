[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TreeTableProps

# Interface: TreeTableProps\<T\>

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:363](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L363)

## Type Parameters

### T

`T`

## Properties

### actions?

> `optional` **actions**: [`RowActionDef`](RowActionDef.md)\<`T`\>[]

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:371](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L371)

***

### actionVariant?

> `optional` **actionVariant**: [`ActionVariant`](../type-aliases/ActionVariant.md)

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:372](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L372)

***

### activeRowId?

> `optional` **activeRowId**: `string` \| `null`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:370](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L370)

***

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:380](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L380)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:379](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L379)

***

### data

> **data**: `T`[]

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:364](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L364)

***

### density?

> `optional` **density**: `"default"` \| `"compact"` \| `"comfortable"`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:377](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L377)

***

### headerActions?

> `optional` **headerActions**: `ReactNode`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:373](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L373)

***

### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:365](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L365)

***

### onRowClick()?

> `optional` **onRowClick**: (`row`) => `void`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:369](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L369)

#### Parameters

##### row

`T`

#### Returns

`void`

***

### onSortChange()?

> `optional` **onSortChange**: (`sort`) => `void`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:368](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L368)

#### Parameters

##### sort

[`SortState`](SortState.md)

#### Returns

`void`

***

### rounded?

> `optional` **rounded**: `"sm"` \| `"lg"` \| `"none"` \| `"md"`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:378](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L378)

***

### searchFields?

> `optional` **searchFields**: keyof `T` & `string`[]

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:374](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L374)

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:376](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L376)

***

### sort?

> `optional` **sort**: [`SortState`](SortState.md) \| `null`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:367](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L367)

***

### tree?

> `optional` **tree**: [`TreeConfig`](TreeConfig.md)\<`T`\>

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:366](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L366)

***

### variant?

> `optional` **variant**: `"default"` \| `"striped"` \| `"bordered"`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:375](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L375)
