[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudListFilters

# Interface: CrudListFilters

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L28)

Filter state returned by [useCrudList](../functions/useCrudList.md).

## Properties

### apply()

> **apply**: () => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:37](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L37)

#### Returns

`void`

***

### clear()

> **clear**: () => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L36)

#### Returns

`void`

***

### committedValues

> **committedValues**: `Record`\<`string`, `unknown`\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:48](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L48)

Committed (applied) filter values — used by badges, URL sync, and queries.

***

### commitValue()

> **commitValue**: (`key`, `value`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:50](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L50)

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

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:52](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L52)

Update multiple filters in both pending and committed state, triggering a re-query.

#### Parameters

##### updates

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:46](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L46)

Whether the list's first page is still in flight — no rows and no total
have arrived yet. `CrudList.FilterBar` reads it to hold the total-count
badge in its unknown state instead of stating `Total 0`, which a reader
takes as "there is nothing here". Stays `false` on a refetch that already
has data, so paging does not blank a known count.

***

### isPending

> **isPending**: `boolean`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:38](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L38)

***

### search

> **search**: `string`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L29)

***

### setAll()

> **setAll**: (`filters`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L35)

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

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L30)

#### Parameters

##### value

`string`

#### Returns

`void`

***

### setValue()

> **setValue**: (`key`, `value`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L33)

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

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:34](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L34)

#### Parameters

##### updates

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### values

> **values**: `Record`\<`string`, `unknown`\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:32](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L32)

Pending (draft) filter values — used by popover form fields.
