[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / composeSchemes

# Function: composeSchemes()

> **composeSchemes**(...`schemes`): [`AuthScheme`](../interfaces/AuthScheme.md)

Defined in: [packages/auth/src/schemes/compose-schemes.ts:17](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/auth/src/schemes/compose-schemes.ts#L17)

Composes multiple [AuthScheme](../interfaces/AuthScheme.md)s into a single scheme.

Headers from all schemes are merged (later schemes override earlier ones
for conflicting header names). Refresh attempts each scheme in order.

## Parameters

### schemes

...[`AuthScheme`](../interfaces/AuthScheme.md)[]

## Returns

[`AuthScheme`](../interfaces/AuthScheme.md)

## Example

```ts
const composed = composeSchemes(
  bearerScheme({ store, token: () => store.get("access_token") }),
  apiKeyScheme({ in: "header", name: "X-API-Key", key: "sk-abc" }),
);
```
