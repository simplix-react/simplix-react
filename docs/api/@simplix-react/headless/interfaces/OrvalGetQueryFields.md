[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / OrvalGetQueryFields

# Interface: OrvalGetQueryFields

Defined in: [adapt-orval-get.ts:16](https://github.com/simplix-react/simplix-react/blob/main/adapt-orval-get.ts#L16)

Common React Query fields preserved when the query type is not supplied
explicitly. Used as the default for the `Q` type parameter so the single
type-argument form (`adaptOrvalGet<Dto>(query)`) keeps the usual fields.

## Properties

### error

> **error**: `unknown`

Defined in: [adapt-orval-get.ts:19](https://github.com/simplix-react/simplix-react/blob/main/adapt-orval-get.ts#L19)

***

### isError

> **isError**: `boolean`

Defined in: [adapt-orval-get.ts:18](https://github.com/simplix-react/simplix-react/blob/main/adapt-orval-get.ts#L18)

***

### isFetching

> **isFetching**: `boolean`

Defined in: [adapt-orval-get.ts:20](https://github.com/simplix-react/simplix-react/blob/main/adapt-orval-get.ts#L20)

***

### isLoading

> **isLoading**: `boolean`

Defined in: [adapt-orval-get.ts:17](https://github.com/simplix-react/simplix-react/blob/main/adapt-orval-get.ts#L17)

***

### isSuccess

> **isSuccess**: `boolean`

Defined in: [adapt-orval-get.ts:21](https://github.com/simplix-react/simplix-react/blob/main/adapt-orval-get.ts#L21)

***

### refetch()

> **refetch**: (...`args`) => `unknown`

Defined in: [adapt-orval-get.ts:22](https://github.com/simplix-react/simplix-react/blob/main/adapt-orval-get.ts#L22)

#### Parameters

##### args

...`never`[]

#### Returns

`unknown`
