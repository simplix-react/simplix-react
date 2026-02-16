[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / tableExists

# Function: tableExists()

> **tableExists**(`db`, `tableName`): `Promise`\<`boolean`\>

Defined in: [sql/migration-helpers.ts:20](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/mock/src/sql/migration-helpers.ts#L20)

Checks whether a table exists in the database by querying `information_schema.tables`.

## Parameters

### db

`PGlite`

The PGlite instance.

### tableName

`string`

The name of the table to check.

## Returns

`Promise`\<`boolean`\>

`true` if the table exists, `false` otherwise.

## Example

```ts
import { initPGlite, tableExists } from "@simplix-react/mock";

const db = await initPGlite("idb://project-mock");
if (!(await tableExists(db, "tasks"))) {
  await db.query("CREATE TABLE tasks (id TEXT PRIMARY KEY)");
}
```
