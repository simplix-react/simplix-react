[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / addColumnIfNotExists

# Function: addColumnIfNotExists()

> **addColumnIfNotExists**(`db`, `tableName`, `columnName`, `columnDef`): `Promise`\<`void`\>

Defined in: [sql/migration-helpers.ts:114](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/mock/src/sql/migration-helpers.ts#L114)

Adds a column to a table only if it does not already exist.

Combines [columnExists](columnExists.md) with an `ALTER TABLE ADD COLUMN` statement
for safe, idempotent schema migrations.

## Parameters

### db

`PGlite`

The PGlite instance.

### tableName

`string`

The target table.

### columnName

`string`

The column name to add.

### columnDef

`string`

The column type definition (e.g. `"TEXT NOT NULL DEFAULT ''"`).

## Returns

`Promise`\<`void`\>

## Example

```ts
import { initPGlite, addColumnIfNotExists } from "@simplix-react/mock";

const db = await initPGlite("idb://project-mock");
await addColumnIfNotExists(db, "tasks", "priority", "INTEGER DEFAULT 0");
```

## See

[columnExists](columnExists.md) - Used internally to check existence.
