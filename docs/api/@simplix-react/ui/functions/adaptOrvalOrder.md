[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / adaptOrvalOrder

# Function: adaptOrvalOrder()

> **adaptOrvalOrder**\<`T`\>(`mutation`, `idField`, `orderField`, `opts?`): (`items`) => `Promise`\<`void`\>

Defined in: [packages/headless/dist/index.d.ts:253](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L253)

Adapts an Orval **order** mutation to produce a reorder callback.
Transforms reordered data into `[{ [idField]: id, [orderField]: index+1 }]`
and calls the mutation.

## Type Parameters

### T

`T`

## Parameters

### mutation

[`OrvalMutationLike`](../interfaces/OrvalMutationLike.md)

Orval order mutation hook result (e.g. `useOrderSite()`)

### idField

`string`

Row ID field name (e.g. "id")

### orderField

`string`

Order field name (e.g. "displayOrder", "sortOrder")

### opts?

#### onSettled?

() => `void`

## Returns

> (`items`): `Promise`\<`void`\>

### Parameters

#### items

`T`[]

### Returns

`Promise`\<`void`\>
