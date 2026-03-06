[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseCrudListOptions

# Interface: UseCrudListOptions

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:34](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L34)

Configuration options for the [useCrudList](../functions/useCrudList.md) hook.

## Properties

### defaultFilters?

> `optional` **defaultFilters**: `Record`\<`string`, `unknown`\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:46](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L46)

Initial filter values.

***

### defaultPageSize?

> `optional` **defaultPageSize**: `number`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:44](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L44)

Initial page size. Defaults to `10`.

***

### defaultSort?

> `optional` **defaultSort**: [`SortState`](SortState.md)

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:42](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L42)

Initial sort field and direction.

***

### filterMode?

> `optional` **filterMode**: `"immediate"` \| `"deferred"`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:38](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L38)

Whether filter changes apply immediately or require an explicit `apply()` call. Defaults to `"deferred"`.

***

### maxRows?

> `optional` **maxRows**: `number`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:40](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L40)

Maximum number of rows to display.

***

### stateMode?

> `optional` **stateMode**: `"server"` \| `"client"`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L36)

Whether filtering/sorting/pagination is handled by the server or client. Defaults to `"server"`.
