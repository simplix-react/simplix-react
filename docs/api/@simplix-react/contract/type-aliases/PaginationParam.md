[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / PaginationParam

# Type Alias: PaginationParam

> **PaginationParam** = \{ `limit`: `number`; `page`: `number`; `type`: `"offset"`; \} \| \{ `cursor`: `string`; `limit`: `number`; `type`: `"cursor"`; \}

Defined in: [packages/contract/src/helpers/query-types.ts:34](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/contract/src/helpers/query-types.ts#L34)

Describes pagination strategy, supporting both offset-based and cursor-based patterns.

## Example

```ts
import type { PaginationParam } from "@simplix-react/contract";

// Offset-based
const offset: PaginationParam = { type: "offset", page: 1, limit: 20 };

// Cursor-based
const cursor: PaginationParam = { type: "cursor", cursor: "abc123", limit: 20 };
```
