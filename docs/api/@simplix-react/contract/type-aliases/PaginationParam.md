[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / PaginationParam

# Type Alias: PaginationParam

> **PaginationParam** = \{ `limit`: `number`; `page`: `number`; `type`: `"offset"`; \} \| \{ `cursor`: `string`; `limit`: `number`; `type`: `"cursor"`; \}

Defined in: [packages/contract/src/helpers/query-types.ts:34](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/contract/src/helpers/query-types.ts#L34)

Describes pagination strategy, supporting both offset-based and cursor-based patterns.

## Example

```ts
import type { PaginationParam } from "@simplix-react/contract";

// Offset-based
const offset: PaginationParam = { type: "offset", page: 1, limit: 20 };

// Cursor-based
const cursor: PaginationParam = { type: "cursor", cursor: "abc123", limit: 20 };
```
