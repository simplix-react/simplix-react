[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / AuthInstance

# Interface: AuthInstance

Defined in: packages/auth/src/types.ts:94

Reactive auth instance returned by [createAuth](../functions/createAuth.md).

Provides a `fetchFn` compatible with defineApi that automatically
injects auth headers, handles 401 retries, and manages token refresh.

## Properties

### fetchFn

> **fetchFn**: [`FetchFn`](../@simplix-react/contract/type-aliases/FetchFn.md)

Defined in: packages/auth/src/types.ts:96

Authenticated fetch function for use with `defineApi`.

## Methods

### clear()

> **clear**(): `void`

Defined in: packages/auth/src/types.ts:108

Clears all auth state and notifies subscribers.

#### Returns

`void`

***

### getAccessToken()

> **getAccessToken**(): `string` \| `null`

Defined in: packages/auth/src/types.ts:102

Returns the current access token from the store, or `null`.

#### Returns

`string` \| `null`

***

### isAuthenticated()

> **isAuthenticated**(): `boolean`

Defined in: packages/auth/src/types.ts:99

Returns true if any scheme reports valid credentials.

#### Returns

`boolean`

***

### setTokens()

> **setTokens**(`tokens`): `void`

Defined in: packages/auth/src/types.ts:105

Stores a token pair and notifies subscribers.

#### Parameters

##### tokens

[`TokenPair`](TokenPair.md)

#### Returns

`void`

***

### subscribe()

> **subscribe**(`listener`): () => `void`

Defined in: packages/auth/src/types.ts:114

Subscribes to auth state changes.

#### Parameters

##### listener

() => `void`

#### Returns

An unsubscribe function.

> (): `void`

##### Returns

`void`
