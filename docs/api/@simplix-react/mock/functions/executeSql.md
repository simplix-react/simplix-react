[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / executeSql

# Function: executeSql()

> **executeSql**(`db`, `sql`): `Promise`\<`void`\>

Defined in: [sql/migration-helpers.ts:82](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/mock/src/sql/migration-helpers.ts#L82)

Executes multiple SQL statements separated by semicolons.

Splits the input on `;`, trims each statement, filters out empty strings,
and executes them sequentially.

## Parameters

### db

`PGlite`

The PGlite instance.

### sql

`string`

A string containing one or more semicolon-separated SQL statements.

## Returns

`Promise`\<`void`\>

## Example

```ts
import { initPGlite, executeSql } from "@simplix-react/mock";

const db = await initPGlite("idb://project-mock");
await executeSql(db, `
  CREATE TABLE projects (id TEXT PRIMARY KEY, name TEXT NOT NULL);
  CREATE TABLE tasks (id TEXT PRIMARY KEY, project_id TEXT REFERENCES projects(id));
`);
```
