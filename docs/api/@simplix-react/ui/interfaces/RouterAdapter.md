[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / RouterAdapter

# Interface: RouterAdapter

Defined in: packages/ui/src/adapters/router-provider.ts:4

Router abstraction interface. Adapters (e.g., React Router) implement this contract.

## Properties

### getSearchParams()

> **getSearchParams**: () => `URLSearchParams`

Defined in: packages/ui/src/adapters/router-provider.ts:6

#### Returns

`URLSearchParams`

***

### navigate()

> **navigate**: (`to`, `options?`) => `void`

Defined in: packages/ui/src/adapters/router-provider.ts:5

#### Parameters

##### to

`string`

##### options?

###### replace?

`boolean`

#### Returns

`void`

***

### setSearchParams()

> **setSearchParams**: (`params`, `options?`) => `void`

Defined in: packages/ui/src/adapters/router-provider.ts:7

#### Parameters

##### params

`URLSearchParams`

##### options?

###### replace?

`boolean`

#### Returns

`void`

***

### useCurrentPath()

> **useCurrentPath**: () => `string`

Defined in: packages/ui/src/adapters/router-provider.ts:11

#### Returns

`string`
