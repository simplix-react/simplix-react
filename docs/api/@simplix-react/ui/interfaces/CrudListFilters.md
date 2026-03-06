[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudListFilters

# Interface: CrudListFilters

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:50](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L50)

Filter state returned by [useCrudList](../functions/useCrudList.md).

## Properties

### apply()

> **apply**: () => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:58](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L58)

#### Returns

`void`

***

### clear()

> **clear**: () => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:57](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L57)

#### Returns

`void`

***

### isPending

> **isPending**: `boolean`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:59](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L59)

***

### search

> **search**: `string`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:51](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L51)

***

### setAll()

> **setAll**: (`filters`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:56](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L56)

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

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:52](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L52)

#### Parameters

##### value

`string`

#### Returns

`void`

***

### setValue()

> **setValue**: (`key`, `value`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:54](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L54)

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

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:55](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L55)

#### Parameters

##### updates

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### values

> **values**: `Record`\<`string`, `unknown`\>

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:53](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L53)
