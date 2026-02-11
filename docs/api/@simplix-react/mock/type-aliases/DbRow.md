[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / DbRow

# Type Alias: DbRow

> **DbRow** = `Record`\<`string`, `unknown`\>

Defined in: [sql/row-mapping.ts:10](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/mock/src/sql/row-mapping.ts#L10)

Represents a raw database row with unknown column values.

Used as the input type for row-mapping functions that convert snake_case
database columns to camelCase JavaScript properties.

## See

 - [mapRow](../functions/mapRow.md) - Maps a single row.
 - [mapRows](../functions/mapRows.md) - Maps an array of rows.
