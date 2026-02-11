[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / SetClauseResult

# Interface: SetClauseResult

Defined in: sql/query-building.ts:11

Represents the result of [buildSetClause](../functions/buildSetClause.md).

Contains the SQL SET clause string, the ordered parameter values, and the next
available parameter index for appending additional conditions (e.g. a WHERE clause).

## See

[buildSetClause](../functions/buildSetClause.md) - Produces this result.

## Properties

### clause

> **clause**: `string`

Defined in: sql/query-building.ts:13

The SQL SET clause string (e.g. `"name = $1, updated_at = NOW()"`).

***

### nextIndex

> **nextIndex**: `number`

Defined in: sql/query-building.ts:17

The next available `$N` parameter index.

***

### values

> **values**: `unknown`[]

Defined in: sql/query-building.ts:15

The ordered parameter values corresponding to the placeholders.
