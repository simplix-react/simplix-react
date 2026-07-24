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

### stateMode?

> `optional` **stateMode**: `"server"` \| `"client"`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L14)

Whether filtering/sorting/pagination is handled by the server or client. Defaults to `"server"`.
