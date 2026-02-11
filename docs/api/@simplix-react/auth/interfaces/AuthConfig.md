[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / AuthConfig

# Interface: AuthConfig

Defined in: packages/auth/src/types.ts:72

Configuration for creating an auth instance via [createAuth](../functions/createAuth.md).

## Properties

### maxRetries?

> `optional` **maxRetries**: `number`

Defined in: packages/auth/src/types.ts:83

Maximum retry attempts after 401. Defaults to `1`.

***

### onRefreshFailure()?

> `optional` **onRefreshFailure**: (`error`) => `void`

Defined in: packages/auth/src/types.ts:80

Called when all refresh attempts fail.

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### schemes

> **schemes**: [`AuthScheme`](AuthScheme.md)[]

Defined in: packages/auth/src/types.ts:74

One or more authentication schemes to compose.

***

### store?

> `optional` **store**: [`TokenStore`](TokenStore.md)

Defined in: packages/auth/src/types.ts:77

Token store shared across schemes.
