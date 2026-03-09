[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudListSort

# Interface: CrudListSort

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:70](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L70)

Sort state returned by [useCrudList](../functions/useCrudList.md).

## Properties

### direction

> **direction**: `"desc"` \| `"asc"`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:72](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L72)

***

### field

> **field**: `string` \| `null`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:71](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L71)

***

### setSort()

> **setSort**: (`field`, `direction`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:73](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L73)

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

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:74](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L74)

#### Parameters

##### field

`string`

#### Returns

`void`
