[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / adaptOrvalDelete

# Function: adaptOrvalDelete()

> **adaptOrvalDelete**\<`TId`\>(`mutation`, `pathParam`, `opts?`): [`CrudMutation`](../interfaces/CrudMutation.md)\<`TId`\>

Defined in: [packages/ui/src/crud/form/adapt-orval-mutation.ts:63](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/adapt-orval-mutation.ts#L63)

Adapts an Orval **delete** mutation (`mutate({ [pathParam]: id })`) to the
[CrudMutation](../interfaces/CrudMutation.md) interface (`mutate(id)`).

## Type Parameters

### TId

`TId` = `string` \| `number`

## Parameters

### mutation

`OrvalMutationLike`

Orval delete mutation hook result

### pathParam

`string`

The path parameter name used by Orval (e.g. `"petId"`)

### opts?

#### onSettled?

() => `void`

## Returns

[`CrudMutation`](../interfaces/CrudMutation.md)\<`TId`\>
