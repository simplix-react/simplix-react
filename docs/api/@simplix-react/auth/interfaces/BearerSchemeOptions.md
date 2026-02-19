[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / BearerSchemeOptions

# Interface: BearerSchemeOptions

Defined in: [packages/auth/src/types.ts:141](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L141)

Options for [bearerScheme](../functions/bearerScheme.md).

## Properties

### refresh?

> `optional` **refresh**: `object`

Defined in: [packages/auth/src/types.ts:152](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L152)

Optional refresh configuration.

#### autoSchedule?

> `optional` **autoSchedule**: `boolean`

Enable background timer-based auto refresh. Defaults to `false`.

#### minIntervalSeconds?

> `optional` **minIntervalSeconds**: `number`

Minimum interval between scheduled refreshes in seconds. Defaults to `30`.

#### onScheduledRefreshFailed()?

> `optional` **onScheduledRefreshFailed**: () => `void`

Called when a scheduled background refresh fails.

##### Returns

`void`

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

Defined in: [packages/auth/src/types.ts:143](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L143)

Token store for persisting access and refresh tokens.

***

### token

> **token**: `string` \| () => `string` \| `null`

Defined in: [packages/auth/src/types.ts:149](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L149)

Static token string or function returning the current access token.
If a function, called on each request.
