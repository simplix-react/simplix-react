[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / DbRow

# Type Alias: DbRow

> **DbRow** = `Record`\<`string`, `unknown`\>

Defined in: [sql/row-mapping.ts:10](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/mock/src/sql/row-mapping.ts#L10)

Represents a raw database row with unknown column values.

Used as the input type for row-mapping functions that convert snake_case
database columns to camelCase JavaScript properties.

## See

 - [mapRow](../functions/mapRow.md) - Maps a single row.
 - [mapRows](../functions/mapRows.md) - Maps an array of rows.
