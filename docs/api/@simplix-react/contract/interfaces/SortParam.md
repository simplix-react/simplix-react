[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / SortParam

# Interface: SortParam

Defined in: packages/contract/src/helpers/query-types.ts:13

Describes a single sort directive with field name and direction.

## Example

```ts
import type { SortParam } from "@simplix-react/contract";

const sort: SortParam = { field: "createdAt", direction: "desc" };
```

## Properties

### direction

> **direction**: `"asc"` \| `"desc"`

Defined in: packages/contract/src/helpers/query-types.ts:17

Sort direction: ascending or descending.

***

### field

> **field**: `string`

Defined in: packages/contract/src/helpers/query-types.ts:15

The field name to sort by.
