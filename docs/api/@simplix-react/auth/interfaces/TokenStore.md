[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / TokenStore

# Interface: TokenStore

Defined in: packages/auth/src/types.ts:48

Abstraction over key-value storage for tokens.

## See

 - [memoryStore](../functions/memoryStore.md) for in-memory implementation.
 - [localStorageStore](../functions/localStorageStore.md) for localStorage-based storage.
 - [sessionStorageStore](../functions/sessionStorageStore.md) for sessionStorage-based storage.

## Methods

### clear()

> **clear**(): `void`

Defined in: packages/auth/src/types.ts:52

#### Returns

`void`

***

### get()

> **get**(`key`): `string` \| `null`

Defined in: packages/auth/src/types.ts:49

#### Parameters

##### key

`string`

#### Returns

`string` \| `null`

***

### remove()

> **remove**(`key`): `void`

Defined in: packages/auth/src/types.ts:51

#### Parameters

##### key

`string`

#### Returns

`void`

***

### set()

> **set**(`key`, `value`): `void`

Defined in: packages/auth/src/types.ts:50

#### Parameters

##### key

`string`

##### value

`string`

#### Returns

`void`
