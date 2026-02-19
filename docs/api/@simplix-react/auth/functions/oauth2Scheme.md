[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / oauth2Scheme

# Function: oauth2Scheme()

> **oauth2Scheme**(`options`): [`AuthScheme`](../interfaces/AuthScheme.md)

Defined in: [packages/auth/src/schemes/oauth2-scheme.ts:22](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/auth/src/schemes/oauth2-scheme.ts#L22)

Creates an OAuth2 refresh_token grant [AuthScheme](../interfaces/AuthScheme.md).

Attaches a Bearer token to requests and refreshes it via the
standard OAuth2 `refresh_token` grant when expired.

## Parameters

### options

[`OAuth2SchemeOptions`](../interfaces/OAuth2SchemeOptions.md)

## Returns

[`AuthScheme`](../interfaces/AuthScheme.md)

## Example

```ts
const store = localStorageStore("myapp:");
const scheme = oauth2Scheme({
  store,
  tokenEndpoint: "https://auth.example.com/oauth/token",
  clientId: "my-client-id",
  scopes: ["read", "write"],
});
```
