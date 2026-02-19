[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / TokenStore

# Interface: TokenStore

Defined in: [packages/auth/src/types.ts:48](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/auth/src/types.ts#L48)

Abstraction over key-value storage for tokens.

## See

 - [memoryStore](../functions/memoryStore.md) for in-memory implementation.
 - [localStorageStore](../functions/localStorageStore.md) for localStorage-based storage.
 - [sessionStorageStore](../functions/sessionStorageStore.md) for sessionStorage-based storage.

## Methods

### clear()

> **clear**(): `void`

Defined in: [packages/auth/src/types.ts:52](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/auth/src/types.ts#L52)

#### Returns

`void`

***

### get()

> **get**(`key`): `string` \| `null`

Defined in: [packages/auth/src/types.ts:49](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/auth/src/types.ts#L49)

#### Parameters

##### key

`string`

#### Returns

`string` \| `null`

***

### remove()

> **remove**(`key`): `void`

Defined in: [packages/auth/src/types.ts:51](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/auth/src/types.ts#L51)

#### Parameters

##### key

`string`

#### Returns

`void`

***

### set()

> **set**(`key`, `value`): `void`

Defined in: [packages/auth/src/types.ts:50](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/auth/src/types.ts#L50)

#### Parameters

##### key

`string`

##### value

`string`

#### Returns

`void`
