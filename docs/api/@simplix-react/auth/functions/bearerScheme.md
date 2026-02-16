[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / bearerScheme

# Function: bearerScheme()

> **bearerScheme**(`options`): [`AuthScheme`](../interfaces/AuthScheme.md)

Defined in: [packages/auth/src/schemes/bearer-scheme.ts:26](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/auth/src/schemes/bearer-scheme.ts#L26)

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
