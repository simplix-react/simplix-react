[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / LocalQueryDef

# Interface: LocalQueryDef\<TData\>

Defined in: [packages/react/src/local-query.ts:38](https://github.com/simplix-react/simplix-react/blob/main/packages/react/src/local-query.ts#L38)

A single locally-persisted, refetch-averse query definition.

## Type Parameters

### TData

`TData`

The resolved query data type.

## Properties

### gcTime?

> `optional` **gcTime**: `number`

Defined in: [packages/react/src/local-query.ts:49](https://github.com/simplix-react/simplix-react/blob/main/packages/react/src/local-query.ts#L49)

GC window. Defaults to the store's `maxAge` so persisted data survives restore.

***

### key

> **key**: readonly `unknown`[]

Defined in: [packages/react/src/local-query.ts:40](https://github.com/simplix-react/simplix-react/blob/main/packages/react/src/local-query.ts#L40)

Stable query key; also the persistence-registry key (prefix-matched).

***

### queryFn()

> **queryFn**: (`ctx`) => `Promise`\<`TData`\>

Defined in: [packages/react/src/local-query.ts:43](https://github.com/simplix-react/simplix-react/blob/main/packages/react/src/local-query.ts#L43)

Fetcher invoked by react-query when the cache is missing or stale.

#### Parameters

##### ctx

###### signal?

`AbortSignal`

#### Returns

`Promise`\<`TData`\>

***

### staleTime?

> `optional` **staleTime**: `number`

Defined in: [packages/react/src/local-query.ts:46](https://github.com/simplix-react/simplix-react/blob/main/packages/react/src/local-query.ts#L46)

Freshness window. Defaults to `Infinity` (refetch only on invalidation).
