[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / columnExists

# Function: columnExists()

> **columnExists**(`db`, `tableName`, `columnName`): `Promise`\<`boolean`\>

Defined in: [sql/migration-helpers.ts:47](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/mock/src/sql/migration-helpers.ts#L47)

Checks whether a column exists in a table by querying `information_schema.columns`.

## Parameters

### db

`PGlite`

The PGlite instance.

### tableName

`string`

The table to inspect.

### columnName

`string`

The column name to check for.

## Returns

`Promise`\<`boolean`\>

`true` if the column exists, `false` otherwise.

## Example

```ts
import { initPGlite, columnExists } from "@simplix-react/mock";

const db = await initPGlite("idb://project-mock");
const has = await columnExists(db, "tasks", "priority");
```
