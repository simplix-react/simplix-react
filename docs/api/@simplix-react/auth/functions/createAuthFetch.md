[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / createAuthFetch

# Function: createAuthFetch()

> **createAuthFetch**(`config`, `baseFetchFn?`): [`FetchFn`](../@simplix-react/contract/type-aliases/FetchFn.md)

Defined in: [packages/auth/src/create-auth-fetch.ts:28](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/auth/src/create-auth-fetch.ts#L28)

Creates an authenticated [FetchFn](../@simplix-react/contract/type-aliases/FetchFn.md) that wraps a base fetch function.

Injects auth headers from all configured schemes, handles 401 responses
with single-flight token refresh, and retries the original request.

## Parameters

### config

[`AuthConfig`](../interfaces/AuthConfig.md)

Auth configuration with schemes and retry settings.

### baseFetchFn?

[`FetchFn`](../@simplix-react/contract/type-aliases/FetchFn.md) = `defaultFetch`

Base fetch function to wrap. Defaults to [defaultFetch](../@simplix-react/contract/functions/defaultFetch.md).

## Returns

[`FetchFn`](../@simplix-react/contract/type-aliases/FetchFn.md)

An authenticated [FetchFn](../@simplix-react/contract/type-aliases/FetchFn.md) for use with `defineApi`.

## Example

```ts
const fetchFn = createAuthFetch({
  schemes: [bearerScheme({ store, token: () => store.get("access_token") })],
  onRefreshFailure: () => redirectToLogin(),
});

const api = defineApi(config, { fetchFn });
```
