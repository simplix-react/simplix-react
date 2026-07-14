[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / adaptOrvalUpdate

# Function: adaptOrvalUpdate()

> **adaptOrvalUpdate**\<`T`, `TId`\>(`mutation`, `pathParam?`, `opts?`): [`CrudMutation`](../interfaces/CrudMutation.md)\<\{ `dto`: `T`; `id`: `TId`; \}\>

Defined in: [packages/ui/src/crud/form/adapt-orval-mutation.ts:47](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/adapt-orval-mutation.ts#L47)

Adapts an Orval **update** mutation to the [CrudMutation](../interfaces/CrudMutation.md) interface
(`mutate({ id, dto })`).

- With `pathParam`: sends `{ [pathParam]: id, data: { [pathParam]: id, ...dto } }` —
  the id is mirrored into the body because update DTOs commonly declare the
  id field as required, while form values only carry editable fields.
- Without `pathParam`: sends `{ data: dto }` (body-only update)

## Type Parameters

### T

`T`

### TId

`TId` = `string`

## Parameters

### mutation

[`OrvalMutationLike`](../interfaces/OrvalMutationLike.md)

Orval update mutation hook result

### pathParam?

`string`

The path parameter name used by Orval (e.g. `"petId"`).
  Omit for endpoints that identify the resource via the request body.

### opts?

#### onSettled?

() => `void`

## Returns

[`CrudMutation`](../interfaces/CrudMutation.md)\<\{ `dto`: `T`; `id`: `TId`; \}\>
