[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / adaptOrvalCreate

# Function: adaptOrvalCreate()

> **adaptOrvalCreate**\<`T`\>(`mutation`, `opts?`): [`CrudMutation`](../interfaces/CrudMutation.md)\<`T`\>

Defined in: [packages/headless/dist/index.d.ts:212](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L212)

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
