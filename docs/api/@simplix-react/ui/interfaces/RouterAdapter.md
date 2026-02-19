[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / RouterAdapter

# Interface: RouterAdapter

Defined in: [packages/ui/src/adapters/router-provider.ts:4](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/adapters/router-provider.ts#L4)

Router abstraction interface. Adapters (e.g., React Router) implement this contract.

## Properties

### getSearchParams()

> **getSearchParams**: () => `URLSearchParams`

Defined in: [packages/ui/src/adapters/router-provider.ts:6](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/adapters/router-provider.ts#L6)

#### Returns

`URLSearchParams`

***

### navigate()

> **navigate**: (`to`, `options?`) => `void`

Defined in: [packages/ui/src/adapters/router-provider.ts:5](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/adapters/router-provider.ts#L5)

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

Defined in: [packages/ui/src/adapters/router-provider.ts:7](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/adapters/router-provider.ts#L7)

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

Defined in: [packages/ui/src/adapters/router-provider.ts:11](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/adapters/router-provider.ts#L11)

#### Returns

`string`
