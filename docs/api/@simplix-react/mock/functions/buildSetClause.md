[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / buildSetClause

# Function: buildSetClause()

> **buildSetClause**\<`T`\>(`input`, `startIndex?`): [`SetClauseResult`](../interfaces/SetClauseResult.md)

Defined in: [sql/query-building.ts:49](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/mock/src/sql/query-building.ts#L49)

Builds a parameterized SQL SET clause from a partial update object.

Converts camelCase object keys to snake_case column names, skips `undefined`
values, serializes nested objects as JSONB, and automatically appends
`updated_at = NOW()`.

## Type Parameters

### T

`T` *extends* `object`

The shape of the update DTO.

## Parameters

### input

`T`

The partial object whose defined keys become SET assignments.

### startIndex?

`number` = `1`

The starting `$N` placeholder index.

## Returns

[`SetClauseResult`](../interfaces/SetClauseResult.md)

A [SetClauseResult](../interfaces/SetClauseResult.md) with the clause, values, and next index.

## Example

```ts
import { buildSetClause } from "@simplix-react/mock";

const { clause, values, nextIndex } = buildSetClause(
  { title: "Updated Task", status: "done" },
);
// clause:    "title = $1, status = $2, updated_at = NOW()"
// values:    ["Updated Task", "done"]
// nextIndex: 3

const sql = `UPDATE tasks SET ${clause} WHERE id = $${nextIndex}`;
// sql: "UPDATE tasks SET title = $1, status = $2, updated_at = NOW() WHERE id = $3"
```

## See

[SetClauseResult](../interfaces/SetClauseResult.md) - The return type.
