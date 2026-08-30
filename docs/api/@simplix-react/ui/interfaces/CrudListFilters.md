[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudListFilters

# Interface: CrudListFilters

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:43](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L43)

Filter state returned by [useCrudList](../functions/useCrudList.md).

## Properties

### apply()

> **apply**: () => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:52](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L52)

#### Returns

`void`

***

### clear()

> **clear**: () => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:51](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L51)

#### Returns

`void`

***

### committedValues

> **committedValues**: `Record`\<`string`, `unknown`\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:63](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L63)

Committed (applied) filter values — used by badges, URL sync, and queries.

***

### commitValue()

> **commitValue**: (`key`, `value`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:65](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L65)

Update a single filter in both pending and committed state, triggering a re-query.

#### Parameters

##### key

`string`

##### value

`unknown`

#### Returns

`void`

***

### commitValues()

> **commitValues**: (`updates`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:67](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L67)

Update multiple filters in both pending and committed state, triggering a re-query.

#### Parameters

##### updates

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:61](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L61)

Whether the list's first page is still in flight — no rows and no total
have arrived yet. `CrudList.FilterBar` reads it to hold the total-count
badge in its unknown state instead of stating `Total 0`, which a reader
takes as "there is nothing here". Stays `false` on a refetch that already
has data, so paging does not blank a known count.

***

### isPending

> **isPending**: `boolean`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:53](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L53)

***

### search

> **search**: `string`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:44](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L44)

***

### setAll()

> **setAll**: (`filters`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:50](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L50)

#### Parameters

##### filters

###### search

`string`

###### values

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### setSearch()

> **setSearch**: (`value`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:45](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L45)

#### Parameters

##### value

`string`

#### Returns

`void`

***

### setValue()

> **setValue**: (`key`, `value`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:48](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L48)

#### Parameters

##### key

`string`

##### value

`unknown`

#### Returns

`void`

***

### setValues()

> **setValues**: (`updates`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L49)

#### Parameters

##### updates

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### values

> **values**: `Record`\<`string`, `unknown`\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:47](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L47)

Pending (draft) filter values — used by popover form fields.
