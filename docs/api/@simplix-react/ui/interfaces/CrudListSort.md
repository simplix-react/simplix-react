[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudListSort

# Interface: CrudListSort

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:56](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L56)

Sort state returned by [useCrudList](../functions/useCrudList.md).

## Properties

### direction

> **direction**: `"desc"` \| `"asc"`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:58](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L58)

***

### field

> **field**: `string` \| `null`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:57](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L57)

***

### setSort()

> **setSort**: (`field`, `direction`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:59](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L59)

#### Parameters

##### field

`string`

##### direction

`"desc"` | `"asc"`

#### Returns

`void`

***

### toggleSort()

> **toggleSort**: (`field`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:60](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L60)

#### Parameters

##### field

`string`

#### Returns

`void`
