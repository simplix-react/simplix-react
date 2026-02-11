[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / apiKeyScheme

# Function: apiKeyScheme()

> **apiKeyScheme**(`options`): [`AuthScheme`](../interfaces/AuthScheme.md)

Defined in: packages/auth/src/schemes/api-key-scheme.ts:19

Creates an API Key [AuthScheme](../interfaces/AuthScheme.md).

Attaches the API key as a request header. When `in` is `"query"`,
the key is appended as a query parameter via a custom header that
the fetch wrapper intercepts.

## Parameters

### options

[`ApiKeySchemeOptions`](../interfaces/ApiKeySchemeOptions.md)

## Returns

[`AuthScheme`](../interfaces/AuthScheme.md)

## Example

```ts
const scheme = apiKeyScheme({
  in: "header",
  name: "X-API-Key",
  key: "sk-abc123",
});
```
