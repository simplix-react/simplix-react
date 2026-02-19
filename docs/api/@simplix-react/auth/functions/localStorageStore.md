[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / localStorageStore

# Function: localStorageStore()

> **localStorageStore**(`prefix?`): [`TokenStore`](../interfaces/TokenStore.md)

Defined in: [packages/auth/src/stores/local-storage-store.ts:19](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/stores/local-storage-store.ts#L19)

Creates a [TokenStore](../interfaces/TokenStore.md) backed by `localStorage`.

All keys are automatically prefixed to avoid collisions.
Tokens persist across browser sessions until explicitly cleared.

## Parameters

### prefix?

`string` = `"auth:"`

Key prefix. Defaults to `"auth:"`.

## Returns

[`TokenStore`](../interfaces/TokenStore.md)

## Example

```ts
const store = localStorageStore("myapp:");
store.set("access_token", "abc");
// localStorage key: "myapp:access_token"
```
