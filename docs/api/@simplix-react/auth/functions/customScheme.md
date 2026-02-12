[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / customScheme

# Function: customScheme()

> **customScheme**(`options`): [`AuthScheme`](../interfaces/AuthScheme.md)

Defined in: [packages/auth/src/schemes/custom-scheme.ts:25](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/auth/src/schemes/custom-scheme.ts#L25)

Creates a user-defined [AuthScheme](../interfaces/AuthScheme.md) from callback functions.

Use this when the built-in schemes don't cover your auth flow
(e.g., JWE tokens, form-based auth, HMAC signing).

## Parameters

### options

[`CustomSchemeOptions`](../interfaces/CustomSchemeOptions.md)

## Returns

[`AuthScheme`](../interfaces/AuthScheme.md)

## Example

```ts
const jweAuth = customScheme({
  name: "jwe",
  getHeaders: async () => ({
    Authorization: `Bearer ${await decryptJwe(getStoredJwe())}`,
  }),
  refresh: async () => {
    const res = await fetch("/auth/token", { method: "POST" });
    storeTokens(await res.json());
  },
  isAuthenticated: () => !!getStoredJwe(),
  clear: () => clearStorage(),
});
```
