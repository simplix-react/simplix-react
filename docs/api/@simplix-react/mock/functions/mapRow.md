[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / mapRow

# Function: mapRow()

> **mapRow**\<`T`\>(`row`): `T`

Defined in: sql/row-mapping.ts:69

Maps a single database row from snake_case columns to a camelCase object.

Columns ending in `_at` are automatically converted to `Date` objects.

## Type Parameters

### T

`T`

The expected shape of the mapped object.

## Parameters

### row

[`DbRow`](../type-aliases/DbRow.md)

The raw database row with snake_case keys.

## Returns

`T`

The mapped object with camelCase keys.

## Example

```ts
import { mapRow } from "@simplix-react/mock";

const row = { id: "1", project_id: "p1", created_at: "2025-01-01T00:00:00Z" };
const mapped = mapRow<{ id: string; projectId: string; createdAt: Date }>(row);
// { id: "1", projectId: "p1", createdAt: Date("2025-01-01T00:00:00Z") }
```

## See

 - [mapRows](mapRows.md) - Maps an array of rows.
 - [toCamelCase](toCamelCase.md) - Underlying case conversion.
