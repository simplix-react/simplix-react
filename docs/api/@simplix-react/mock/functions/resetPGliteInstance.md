[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / resetPGliteInstance

# Function: resetPGliteInstance()

> **resetPGliteInstance**(): `void`

Defined in: [pglite.ts:73](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/mock/src/pglite.ts#L73)

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
