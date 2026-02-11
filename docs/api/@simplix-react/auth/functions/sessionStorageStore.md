[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / sessionStorageStore

# Function: sessionStorageStore()

> **sessionStorageStore**(`prefix?`): [`TokenStore`](../interfaces/TokenStore.md)

Defined in: packages/auth/src/stores/session-storage-store.ts:18

Creates a [TokenStore](../interfaces/TokenStore.md) backed by `sessionStorage`.

All keys are automatically prefixed to avoid collisions.
Tokens persist only for the current browser tab/session.

## Parameters

### prefix?

`string` = `"auth:"`

Key prefix. Defaults to `"auth:"`.

## Returns

[`TokenStore`](../interfaces/TokenStore.md)

## Example

```ts
const store = sessionStorageStore("myapp:");
store.set("access_token", "abc");
// sessionStorage key: "myapp:access_token"
```
