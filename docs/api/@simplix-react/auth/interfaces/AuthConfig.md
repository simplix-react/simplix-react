[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / AuthConfig

# Interface: AuthConfig

Defined in: [packages/auth/src/types.ts:76](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L76)

Configuration for creating an auth instance via [createAuth](../functions/createAuth.md).

## Properties

### fetchFn?

> `optional` **fetchFn**: [`FetchFn`](../@simplix-react/contract/type-aliases/FetchFn.md)

Defined in: [packages/auth/src/types.ts:99](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L99)

Base fetch function to wrap with auth headers. Defaults to defaultFetch.

***

### globalHeaders()?

> `optional` **globalHeaders**: () => `Record`\<`string`, `string`\> \| `Promise`\<`Record`\<`string`, `string`\>\>

Defined in: [packages/auth/src/types.ts:96](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L96)

Returns additional headers to merge into every authenticated request.

#### Returns

`Record`\<`string`, `string`\> \| `Promise`\<`Record`\<`string`, `string`\>\>

***

### is401()?

> `optional` **is401**: (`error`) => `boolean`

Defined in: [packages/auth/src/types.ts:90](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L90)

Custom 401 detection predicate. Defaults to duck-typing `error.status === 401`.

#### Parameters

##### error

`unknown`

#### Returns

`boolean`

***

### maxRetries?

> `optional` **maxRetries**: `number`

Defined in: [packages/auth/src/types.ts:87](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L87)

Maximum retry attempts after 401. Defaults to `1`.

***

### onRefreshFailure()?

> `optional` **onRefreshFailure**: (`error`) => `void`

Defined in: [packages/auth/src/types.ts:84](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L84)

Called when all refresh attempts fail.

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### onRehydrate()?

> `optional` **onRehydrate**: (`accessToken`) => `Promise`\<`boolean`\>

Defined in: [packages/auth/src/types.ts:93](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L93)

Validates a stored access token on rehydration. Return `true` if valid.

#### Parameters

##### accessToken

`string`

#### Returns

`Promise`\<`boolean`\>

***

### schemes

> **schemes**: [`AuthScheme`](AuthScheme.md)[]

Defined in: [packages/auth/src/types.ts:78](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L78)

One or more authentication schemes to compose.

***

### store?

> `optional` **store**: [`TokenStore`](TokenStore.md)

Defined in: [packages/auth/src/types.ts:81](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L81)

Token store shared across schemes.
