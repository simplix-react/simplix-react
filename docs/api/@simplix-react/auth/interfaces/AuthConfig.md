[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / AuthConfig

# Interface: AuthConfig

Defined in: [packages/auth/src/types.ts:72](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/auth/src/types.ts#L72)

Configuration for creating an auth instance via [createAuth](../functions/createAuth.md).

## Properties

### maxRetries?

> `optional` **maxRetries**: `number`

Defined in: [packages/auth/src/types.ts:83](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/auth/src/types.ts#L83)

Maximum retry attempts after 401. Defaults to `1`.

***

### onRefreshFailure()?

> `optional` **onRefreshFailure**: (`error`) => `void`

Defined in: [packages/auth/src/types.ts:80](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/auth/src/types.ts#L80)

Called when all refresh attempts fail.

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### schemes

> **schemes**: [`AuthScheme`](AuthScheme.md)[]

Defined in: [packages/auth/src/types.ts:74](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/auth/src/types.ts#L74)

One or more authentication schemes to compose.

***

### store?

> `optional` **store**: [`TokenStore`](TokenStore.md)

Defined in: [packages/auth/src/types.ts:77](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/auth/src/types.ts#L77)

Token store shared across schemes.
