[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / OAuth2SchemeOptions

# Interface: OAuth2SchemeOptions

Defined in: [packages/auth/src/types.ts:187](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L187)

Options for [oauth2Scheme](../functions/oauth2Scheme.md).

## Properties

### clientId

> **clientId**: `string`

Defined in: [packages/auth/src/types.ts:195](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L195)

OAuth2 client ID.

***

### clientSecret?

> `optional` **clientSecret**: `string`

Defined in: [packages/auth/src/types.ts:198](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L198)

OAuth2 client secret (optional for public clients).

***

### scopes?

> `optional` **scopes**: `string`[]

Defined in: [packages/auth/src/types.ts:201](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L201)

Requested scopes.

***

### store

> **store**: [`TokenStore`](TokenStore.md)

Defined in: [packages/auth/src/types.ts:189](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L189)

Token store for persisting OAuth2 tokens.

***

### tokenEndpoint

> **tokenEndpoint**: `string`

Defined in: [packages/auth/src/types.ts:192](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L192)

URL of the token endpoint.

***

### tokenEndpointBody?

> `optional` **tokenEndpointBody**: `Record`\<`string`, `string`\>

Defined in: [packages/auth/src/types.ts:207](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L207)

Additional body parameters for the token endpoint request.

***

### tokenEndpointHeaders?

> `optional` **tokenEndpointHeaders**: `Record`\<`string`, `string`\>

Defined in: [packages/auth/src/types.ts:204](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/types.ts#L204)

Additional headers for the token endpoint request.
