[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / RemoteConfigQueryDef

# Interface: RemoteConfigQueryDef\<T\>

Defined in: [packages/ui/src/config/types.ts:8](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/config/types.ts#L8)

Definition of a single remote-config query injected into [createAppConfig](../functions/createAppConfig.md).

The host supplies the fetcher (and its react-query coordinates); the framework
runs it and distributes the result via the generated context — mirroring the
MenuProvider injection pattern.

## Type Parameters

### T

`T`

## Properties

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [packages/ui/src/config/types.ts:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/config/types.ts#L14)

Gate the query (e.g. only when authenticated). Defaults to enabled.

***

### queryFn()

> **queryFn**: (`ctx`) => `Promise`\<`T`\>

Defined in: [packages/ui/src/config/types.ts:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/config/types.ts#L12)

Host fetcher (e.g. an authenticated `/files/policy` request).

#### Parameters

##### ctx

###### signal?

`AbortSignal`

#### Returns

`Promise`\<`T`\>

***

### queryKey

> **queryKey**: readonly `unknown`[]

Defined in: [packages/ui/src/config/types.ts:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/config/types.ts#L10)

react-query cache key.

***

### staleTime?

> `optional` **staleTime**: `number`

Defined in: [packages/ui/src/config/types.ts:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/config/types.ts#L16)

Per-query staleTime (ms).
