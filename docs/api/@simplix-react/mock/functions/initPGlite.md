[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / initPGlite

# Function: initPGlite()

> **initPGlite**(`dataDir`): `Promise`\<`PGlite`\>

Defined in: [pglite.ts:25](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/mock/src/pglite.ts#L25)

Initializes a singleton PGlite instance with the given data directory.

Uses a dynamic import so that `@electric-sql/pglite` remains an optional peer
dependency. Subsequent calls return the already-initialized instance.

## Parameters

### dataDir

`string`

The IndexedDB data directory for persistence (e.g. `"idb://simplix-mock"`).

## Returns

`Promise`\<`PGlite`\>

The initialized PGlite instance.

## Example

```ts
import { initPGlite } from "@simplix-react/mock";

const db = await initPGlite("idb://project-mock");
await db.query("SELECT 1");
```

## See

 - [getPGliteInstance](getPGliteInstance.md) - Retrieves the current instance without re-initializing.
 - [resetPGliteInstance](resetPGliteInstance.md) - Clears the singleton for testing.
