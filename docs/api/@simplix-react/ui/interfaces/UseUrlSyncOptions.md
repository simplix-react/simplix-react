[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseUrlSyncOptions

# Interface: UseUrlSyncOptions

Defined in: [packages/ui/src/crud/list/use-url-sync.ts:7](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/use-url-sync.ts#L7)

Options for the [useUrlSync](../functions/useUrlSync.md) hook.

## Properties

### filters

> **filters**: [`FilterState`](FilterState.md)

Defined in: [packages/ui/src/crud/list/use-url-sync.ts:8](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/use-url-sync.ts#L8)

***

### pagination

> **pagination**: [`PaginationState`](PaginationState.md)

Defined in: [packages/ui/src/crud/list/use-url-sync.ts:10](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/use-url-sync.ts#L10)

***

### setFilters()

> **setFilters**: (`filters`) => `void`

Defined in: [packages/ui/src/crud/list/use-url-sync.ts:11](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/use-url-sync.ts#L11)

#### Parameters

##### filters

[`FilterState`](FilterState.md)

#### Returns

`void`

***

### setPage()

> **setPage**: (`page`) => `void`

Defined in: [packages/ui/src/crud/list/use-url-sync.ts:13](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/use-url-sync.ts#L13)

#### Parameters

##### page

`number`

#### Returns

`void`

***

### setSort()

> **setSort**: (`field`, `direction`) => `void`

Defined in: [packages/ui/src/crud/list/use-url-sync.ts:12](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/use-url-sync.ts#L12)

#### Parameters

##### field

`string`

##### direction

`"desc"` | `"asc"`

#### Returns

`void`

***

### sort

> **sort**: [`SortState`](SortState.md) \| `null`

Defined in: [packages/ui/src/crud/list/use-url-sync.ts:9](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/list/use-url-sync.ts#L9)
