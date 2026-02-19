[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudListSort

# Interface: CrudListSort

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:34](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L34)

Sort state returned by [useCrudList](../functions/useCrudList.md).

## Properties

### direction

> **direction**: `"desc"` \| `"asc"`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L36)

***

### field

> **field**: `string` \| `null`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L35)

***

### setSort()

> **setSort**: (`field`, `direction`) => `void`

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:37](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L37)

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

Defined in: [packages/ui/src/crud/list/use-crud-list.ts:38](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-crud-list.ts#L38)

#### Parameters

##### field

`string`

#### Returns

`void`
