[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / memoryStore

# Function: memoryStore()

> **memoryStore**(): [`TokenStore`](../interfaces/TokenStore.md)

Defined in: packages/auth/src/stores/memory-store.ts:16

Creates an in-memory [TokenStore](../interfaces/TokenStore.md).

Tokens are stored in a `Map` and lost when the process exits.
Suitable for testing and short-lived sessions.

## Returns

[`TokenStore`](../interfaces/TokenStore.md)

## Example

```ts
const store = memoryStore();
store.set("access_token", "abc123");
store.get("access_token"); // "abc123"
```
