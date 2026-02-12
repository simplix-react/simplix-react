[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / AuthScheme

# Interface: AuthScheme

Defined in: [packages/auth/src/types.ts:16](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/auth/src/types.ts#L16)

Defines the contract for an authentication strategy.

Each scheme encapsulates how credentials are attached to requests,
how tokens are refreshed, and how auth state is managed.

## See

 - [bearerScheme](../functions/bearerScheme.md) for Bearer token authentication.
 - [apiKeyScheme](../functions/apiKeyScheme.md) for API key authentication.
 - [oauth2Scheme](../functions/oauth2Scheme.md) for OAuth2 refresh_token grant flow.
 - [customScheme](../functions/customScheme.md) for user-defined authentication.

## Properties

### name

> `readonly` **name**: `string`

Defined in: [packages/auth/src/types.ts:18](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/auth/src/types.ts#L18)

Unique identifier for this scheme.

## Methods

### clear()

> **clear**(): `void`

Defined in: [packages/auth/src/types.ts:36](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/auth/src/types.ts#L36)

Clears all stored credentials for this scheme.

#### Returns

`void`

***

### getHeaders()

> **getHeaders**(): `Promise`\<`Record`\<`string`, `string`\>\>

Defined in: [packages/auth/src/types.ts:24](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/auth/src/types.ts#L24)

Returns headers to attach to each outgoing request.
May perform async work (e.g., decrypt a stored token).

#### Returns

`Promise`\<`Record`\<`string`, `string`\>\>

***

### isAuthenticated()

> **isAuthenticated**(): `boolean`

Defined in: [packages/auth/src/types.ts:33](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/auth/src/types.ts#L33)

Returns whether the scheme currently holds valid credentials.

#### Returns

`boolean`

***

### refresh()?

> `optional` **refresh**(): `Promise`\<`void`\>

Defined in: [packages/auth/src/types.ts:30](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/auth/src/types.ts#L30)

Attempts to refresh the authentication credentials.
Called when a 401 response is received.

#### Returns

`Promise`\<`void`\>
