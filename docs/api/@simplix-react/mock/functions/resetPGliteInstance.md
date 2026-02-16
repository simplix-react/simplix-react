[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / resetPGliteInstance

# Function: resetPGliteInstance()

> **resetPGliteInstance**(): `void`

Defined in: [pglite.ts:73](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/mock/src/pglite.ts#L73)

Resets the PGlite singleton instance to `null`.

Intended for use in test teardown to ensure a clean state between test runs.

## Returns

`void`

## Example

```ts
import { resetPGliteInstance } from "@simplix-react/mock";

afterEach(() => {
  resetPGliteInstance();
});
```
