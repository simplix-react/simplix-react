[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / BearerSchemeOptions

# Interface: BearerSchemeOptions

Defined in: [packages/auth/src/types.ts:122](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/auth/src/types.ts#L122)

Options for [bearerScheme](../functions/bearerScheme.md).

## Properties

### refresh?

> `optional` **refresh**: `object`

Defined in: [packages/auth/src/types.ts:133](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/auth/src/types.ts#L133)

Optional refresh configuration.

#### refreshBeforeExpiry?

> `optional` **refreshBeforeExpiry**: `number`

Seconds before expiry to trigger proactive refresh.

#### refreshFn()

> **refreshFn**: () => `Promise`\<[`TokenPair`](TokenPair.md)\>

Async function that returns a fresh token pair.

##### Returns

`Promise`\<[`TokenPair`](TokenPair.md)\>

***

### store

> **store**: [`TokenStore`](TokenStore.md)

Defined in: [packages/auth/src/types.ts:124](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/auth/src/types.ts#L124)

Token store for persisting access and refresh tokens.

***

### token

> **token**: `string` \| () => `string` \| `null`

Defined in: [packages/auth/src/types.ts:130](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/auth/src/types.ts#L130)

Static token string or function returning the current access token.
If a function, called on each request.
