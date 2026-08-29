[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseCrudListOptions

# Interface: UseCrudListOptions

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L12)

Configuration options for the [useCrudList](../functions/useCrudList.md) hook.

## Properties

### defaultFilters?

> `optional` **defaultFilters**: `Record`\<`string`, `unknown`\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L24)

Initial filter values.

***

### defaultPageSize?

> `optional` **defaultPageSize**: `number`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L22)

Initial page size. Defaults to `10`.

***

### defaultSort?

> `optional` **defaultSort**: [`SortState`](SortState.md)

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L20)

Initial sort field and direction.

***

### filterMode?

> `optional` **filterMode**: `"immediate"` \| `"deferred"`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L16)

Whether filter changes apply immediately or require an explicit `apply()` call. Defaults to `"deferred"`.

***

### maxRows?

> `optional` **maxRows**: `number`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L18)

Maximum number of rows to display.

***

### scopeKey?

> `optional` **scopeKey**: `string`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:39](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L39)

What the list is narrowed to from outside — a tab, a chip row, a parent record.

<p><b>Pass this whenever something other than the list's own filters decides which records it
asks for.</b> The page index is state the list keeps, and a narrowing that arrives from
outside changes how many pages there are without touching it: a reader on page 5 of 활성 who
presses 정지 asks the server for page 5 of three rows and is given nothing. The total in the
toolbar comes from the same response and is right, so the screen states a count over an empty
table — the one shape a reader reads as a broken list rather than as an empty one.

<p>Changing it returns the list to the first page and clears the selection, which is about the
rows that were there rather than the ones now. Any stable string will do: the tab's key, or
the forced parameters serialised.

***

### stateMode?

> `optional` **stateMode**: `"server"` \| `"client"`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L14)

Whether filtering/sorting/pagination is handled by the server or client. Defaults to `"server"`.
