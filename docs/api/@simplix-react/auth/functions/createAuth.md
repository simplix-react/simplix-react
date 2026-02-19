[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / createAuth

# Function: createAuth()

> **createAuth**(`config`): [`AuthInstance`](../interfaces/AuthInstance.md)

Defined in: [packages/auth/src/create-auth.ts:34](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/auth/src/create-auth.ts#L34)

Creates a reactive [AuthInstance](../interfaces/AuthInstance.md) with state management and subscriptions.

Provides an authenticated `fetchFn` for `defineApi`, plus methods to manage
tokens and subscribe to auth state changes.

## Parameters

### config

[`AuthConfig`](../interfaces/AuthConfig.md)

## Returns

[`AuthInstance`](../interfaces/AuthInstance.md)

## Example

```ts
const store = localStorageStore("myapp:");
const auth = createAuth({
  schemes: [
    bearerScheme({
      store,
      token: () => store.get("access_token"),
      refresh: { refreshFn: myRefreshFn },
    }),
  ],
  store,
  onRefreshFailure: () => (location.href = "/login"),
});

const api = defineApi(config, { fetchFn: auth.fetchFn });

// Subscribe to auth changes
auth.subscribe(() => {
  console.log("Authenticated:", auth.isAuthenticated());
});
```
