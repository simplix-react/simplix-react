[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / adaptOrvalCreate

# Function: adaptOrvalCreate()

> **adaptOrvalCreate**\<`T`\>(`mutation`, `opts?`): [`CrudMutation`](../interfaces/CrudMutation.md)\<`T`\>

Defined in: [packages/ui/src/crud/form/adapt-orval-mutation.ts:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/adapt-orval-mutation.ts#L21)

Adapts an Orval **create** mutation (`mutate({ data: T })`) to the
[CrudMutation](../interfaces/CrudMutation.md) interface (`mutate(values)`).

## Type Parameters

### T

`T`

## Parameters

### mutation

[`OrvalMutationLike`](../interfaces/OrvalMutationLike.md)

### opts?

#### onSettled?

() => `void`

## Returns

[`CrudMutation`](../interfaces/CrudMutation.md)\<`T`\>
