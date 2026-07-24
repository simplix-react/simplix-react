[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudListSort

# Interface: CrudListSort

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:48](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L48)

Sort state returned by [useCrudList](../functions/useCrudList.md).

## Properties

### direction

> **direction**: `"desc"` \| `"asc"`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:50](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L50)

***

### field

> **field**: `string` \| `null`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L49)

***

### setSort()

> **setSort**: (`field`, `direction`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:51](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L51)

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

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:52](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L52)

#### Parameters

##### field

`string`

#### Returns

`void`
