[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / OAuth2SchemeOptions

# Interface: OAuth2SchemeOptions

Defined in: packages/auth/src/types.ts:159

Options for [oauth2Scheme](../functions/oauth2Scheme.md).

## Properties

### clientId

> **clientId**: `string`

Defined in: packages/auth/src/types.ts:167

OAuth2 client ID.

***

### clientSecret?

> `optional` **clientSecret**: `string`

Defined in: packages/auth/src/types.ts:170

OAuth2 client secret (optional for public clients).

***

### scopes?

> `optional` **scopes**: `string`[]

Defined in: packages/auth/src/types.ts:173

Requested scopes.

***

### store

> **store**: [`TokenStore`](TokenStore.md)

Defined in: packages/auth/src/types.ts:161

Token store for persisting OAuth2 tokens.

***

### tokenEndpoint

> **tokenEndpoint**: `string`

Defined in: packages/auth/src/types.ts:164

URL of the token endpoint.

***

### tokenEndpointBody?

> `optional` **tokenEndpointBody**: `Record`\<`string`, `string`\>

Defined in: packages/auth/src/types.ts:179

Additional body parameters for the token endpoint request.

***

### tokenEndpointHeaders?

> `optional` **tokenEndpointHeaders**: `Record`\<`string`, `string`\>

Defined in: packages/auth/src/types.ts:176

Additional headers for the token endpoint request.
