[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / OAuth2SchemeOptions

# Interface: OAuth2SchemeOptions

Defined in: [packages/auth/src/types.ts:159](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/auth/src/types.ts#L159)

Options for [oauth2Scheme](../functions/oauth2Scheme.md).

## Properties

### clientId

> **clientId**: `string`

Defined in: [packages/auth/src/types.ts:167](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/auth/src/types.ts#L167)

OAuth2 client ID.

***

### clientSecret?

> `optional` **clientSecret**: `string`

Defined in: [packages/auth/src/types.ts:170](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/auth/src/types.ts#L170)

OAuth2 client secret (optional for public clients).

***

### scopes?

> `optional` **scopes**: `string`[]

Defined in: [packages/auth/src/types.ts:173](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/auth/src/types.ts#L173)

Requested scopes.

***

### store

> **store**: [`TokenStore`](TokenStore.md)

Defined in: [packages/auth/src/types.ts:161](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/auth/src/types.ts#L161)

Token store for persisting OAuth2 tokens.

***

### tokenEndpoint

> **tokenEndpoint**: `string`

Defined in: [packages/auth/src/types.ts:164](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/auth/src/types.ts#L164)

URL of the token endpoint.

***

### tokenEndpointBody?

> `optional` **tokenEndpointBody**: `Record`\<`string`, `string`\>

Defined in: [packages/auth/src/types.ts:179](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/auth/src/types.ts#L179)

Additional body parameters for the token endpoint request.

***

### tokenEndpointHeaders?

> `optional` **tokenEndpointHeaders**: `Record`\<`string`, `string`\>

Defined in: [packages/auth/src/types.ts:176](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/auth/src/types.ts#L176)

Additional headers for the token endpoint request.
