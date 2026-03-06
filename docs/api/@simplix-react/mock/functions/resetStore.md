[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / resetStore

# Function: resetStore()

> **resetStore**(): `void`

Defined in: [mock-store.ts:108](https://github.com/simplix-react/simplix-react/blob/main/mock-store.ts#L108)

Clears all entity stores and resets all auto-increment counters.

## Returns

`void`

## Example

```ts
import { resetStore } from "@simplix-react/mock";

afterEach(() => {
  resetStore();
});
```
