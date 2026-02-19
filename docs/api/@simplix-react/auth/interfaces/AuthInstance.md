[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / AuthInstance

# Interface: AuthInstance

Defined in: [packages/auth/src/types.ts:104](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L104)

Reactive auth instance returned by [createAuth](../functions/createAuth.md).

Provides a `fetchFn` compatible with `defineApi` that automatically
injects auth headers, handles 401 retries, and manages token refresh.

## Properties

### fetchFn

> **fetchFn**: [`FetchFn`](../@simplix-react/contract/type-aliases/FetchFn.md)

Defined in: [packages/auth/src/types.ts:106](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L106)

Authenticated fetch function for use with `defineApi`.

## Methods

### clear()

> **clear**(): `void`

Defined in: [packages/auth/src/types.ts:118](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L118)

Clears all auth state and notifies subscribers.

#### Returns

`void`

***

### getAccessToken()

> **getAccessToken**(): `string` \| `null`

Defined in: [packages/auth/src/types.ts:112](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L112)

Returns the current access token from the store, or `null`.

#### Returns

`string` \| `null`

***

### getUser()

> **getUser**\<`TUser`\>(): `TUser` \| `null`

Defined in: [packages/auth/src/types.ts:130](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L130)

Returns the current user object, or `null` if not set.

#### Type Parameters

##### TUser

`TUser` = `unknown`

#### Returns

`TUser` \| `null`

***

### isAuthenticated()

> **isAuthenticated**(): `boolean`

Defined in: [packages/auth/src/types.ts:109](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L109)

Returns true if any scheme reports valid credentials.

#### Returns

`boolean`

***

### rehydrate()

> **rehydrate**(): `Promise`\<`void`\>

Defined in: [packages/auth/src/types.ts:127](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L127)

Rehydrates auth state from storage, optionally validating with the server.

#### Returns

`Promise`\<`void`\>

***

### setTokens()

> **setTokens**(`tokens`): `void`

Defined in: [packages/auth/src/types.ts:115](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L115)

Stores a token pair and notifies subscribers.

#### Parameters

##### tokens

[`TokenPair`](TokenPair.md)

#### Returns

`void`

***

### setUser()

> **setUser**\<`TUser`\>(`user`): `void`

Defined in: [packages/auth/src/types.ts:133](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L133)

Sets the current user object and notifies subscribers.

#### Type Parameters

##### TUser

`TUser` = `unknown`

#### Parameters

##### user

`TUser` | `null`

#### Returns

`void`

***

### subscribe()

> **subscribe**(`listener`): () => `void`

Defined in: [packages/auth/src/types.ts:124](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L124)

Subscribes to auth state changes.

#### Parameters

##### listener

() => `void`

#### Returns

An unsubscribe function.

> (): `void`

##### Returns

`void`
