[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / mapRows

# Function: mapRows()

> **mapRows**\<`T`\>(`rows`): `T`[]

Defined in: sql/row-mapping.ts:110

Maps an array of database rows from snake_case to camelCase objects.

Delegates to [mapRow](mapRow.md) for each row.

## Type Parameters

### T

`T`

The expected shape of each mapped object.

## Parameters

### rows

[`DbRow`](../type-aliases/DbRow.md)[]

The array of raw database rows.

## Returns

`T`[]

An array of mapped camelCase objects.

## Example

```ts
import { mapRows } from "@simplix-react/mock";

const rows = [
  { id: "1", task_name: "Build" },
  { id: "2", task_name: "Test" },
];
const mapped = mapRows<{ id: string; taskName: string }>(rows);
// [{ id: "1", taskName: "Build" }, { id: "2", taskName: "Test" }]
```
