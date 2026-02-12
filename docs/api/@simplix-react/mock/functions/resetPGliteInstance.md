[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / resetPGliteInstance

# Function: resetPGliteInstance()

> **resetPGliteInstance**(): `void`

Defined in: [pglite.ts:73](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/mock/src/pglite.ts#L73)

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
