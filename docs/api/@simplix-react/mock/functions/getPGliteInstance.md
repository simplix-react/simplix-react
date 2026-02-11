[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / getPGliteInstance

# Function: getPGliteInstance()

> **getPGliteInstance**(): `PGlite`

Defined in: pglite.ts:50

Returns the current PGlite singleton instance.

Throws an error if [initPGlite](initPGlite.md) has not been called yet.

## Returns

`PGlite`

The active PGlite instance.

## Throws

Error if PGlite has not been initialized.

## Example

```ts
import { getPGliteInstance } from "@simplix-react/mock";

const db = getPGliteInstance();
const result = await db.query("SELECT * FROM tasks");
```
