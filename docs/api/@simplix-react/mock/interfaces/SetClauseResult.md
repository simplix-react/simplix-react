[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / SetClauseResult

# Interface: SetClauseResult

Defined in: [sql/query-building.ts:11](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/mock/src/sql/query-building.ts#L11)

Represents the result of [buildSetClause](../functions/buildSetClause.md).

Contains the SQL SET clause string, the ordered parameter values, and the next
available parameter index for appending additional conditions (e.g. a WHERE clause).

## See

[buildSetClause](../functions/buildSetClause.md) - Produces this result.

## Properties

### clause

> **clause**: `string`

Defined in: [sql/query-building.ts:13](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/mock/src/sql/query-building.ts#L13)

The SQL SET clause string (e.g. `"name = $1, updated_at = NOW()"`).

***

### nextIndex

> **nextIndex**: `number`

Defined in: [sql/query-building.ts:17](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/mock/src/sql/query-building.ts#L17)

The next available `$N` parameter index.

***

### values

> **values**: `unknown`[]

Defined in: [sql/query-building.ts:15](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/mock/src/sql/query-building.ts#L15)

The ordered parameter values corresponding to the placeholders.
