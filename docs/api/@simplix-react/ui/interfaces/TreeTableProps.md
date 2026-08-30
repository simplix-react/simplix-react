[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TreeTableProps

# Interface: TreeTableProps\<T\>

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:311](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L311)

## Type Parameters

### T

`T`

## Properties

### actions?

> `optional` **actions**: [`RowActionDef`](RowActionDef.md)\<`T`\>[]

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:319](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L319)

***

### actionVariant?

> `optional` **actionVariant**: [`ActionVariant`](../type-aliases/ActionVariant.md)

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:320](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L320)

***

### activeRowId?

> `optional` **activeRowId**: `string` \| `null`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:318](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L318)

***

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:337](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L337)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:336](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L336)

***

### data

> **data**: `T`[]

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:312](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L312)

***

### density?

> `optional` **density**: `"default"` \| `"compact"` \| `"comfortable"`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:327](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L327)

***

### headerActions?

> `optional` **headerActions**: `ReactNode`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:321](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L321)

***

### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:313](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L313)

***

### onRowClick()?

> `optional` **onRowClick**: (`row`) => `void`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:317](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L317)

#### Parameters

##### row

`T`

#### Returns

`void`

***

### onSortChange()?

> `optional` **onSortChange**: (`sort`) => `void`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:316](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L316)

#### Parameters

##### sort

[`SortState`](SortState.md)

#### Returns

`void`

***

### rounded?

> `optional` **rounded**: `"none"` \| `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:328](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L328)

***

### searchFields?

> `optional` **searchFields**: keyof `T` & `string`[]

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:322](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L322)

***

### searchPredicate()?

> `optional` **searchPredicate**: (`row`, `query`) => `boolean`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:324](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L324)

Callback-based search predicate. OR-combined with searchFields.

#### Parameters

##### row

`T`

##### query

`string`

#### Returns

`boolean`

***

### size?

> `optional` **size**: `"sm"` \| `"lg"` \| `"md"`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:326](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L326)

***

### sort?

> `optional` **sort**: [`SortState`](SortState.md) \| `null`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:315](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L315)

***

### stickyHeader?

> `optional` **stickyHeader**: `boolean`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:335](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L335)

Sticks the header row to the top of the nearest scrollable ancestor
(e.g. a page, dialog, or detail-pane body) once scrolling would hide it.
The table keeps its own horizontal scrollbar; the floating header scrolls
with its columns. Enabled by default; pass `false` to disable.

***

### tree?

> `optional` **tree**: [`TreeConfig`](TreeConfig.md)\<`T`\>

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:314](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L314)

***

### variant?

> `optional` **variant**: `"default"` \| `"striped"` \| `"bordered"`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:325](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L325)
