[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / bearerScheme

# Function: bearerScheme()

> **bearerScheme**(`options`): [`AuthScheme`](../interfaces/AuthScheme.md)

Defined in: [packages/auth/src/schemes/bearer-scheme.ts:27](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/auth/src/schemes/bearer-scheme.ts#L27)

Creates a Bearer token [AuthScheme](../interfaces/AuthScheme.md).

Attaches an `Authorization: Bearer <token>` header to each request.
Optionally supports proactive token refresh before expiry.

## Parameters

### options

[`BearerSchemeOptions`](../interfaces/BearerSchemeOptions.md)

## Returns

[`AuthScheme`](../interfaces/AuthScheme.md)

## Example

```ts
const store = localStorageStore("myapp:");
const scheme = bearerScheme({
  store,
  token: () => store.get("access_token"),
  refresh: {
    refreshFn: async () => {
      const res = await fetch("/auth/refresh", { method: "POST" });
      return res.json();
    },
  },
});
```
