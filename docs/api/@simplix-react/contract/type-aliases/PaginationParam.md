[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / PaginationParam

# Type Alias: PaginationParam

> **PaginationParam** = \{ `limit`: `number`; `page`: `number`; `type`: `"offset"`; \} \| \{ `cursor`: `string`; `limit`: `number`; `type`: `"cursor"`; \}

Defined in: [packages/contract/src/helpers/query-types.ts:34](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/contract/src/helpers/query-types.ts#L34)

Describes pagination strategy, supporting both offset-based and cursor-based patterns.

## Example

```ts
import type { PaginationParam } from "@simplix-react/contract";

// Offset-based
const offset: PaginationParam = { type: "offset", page: 1, limit: 20 };

// Cursor-based
const cursor: PaginationParam = { type: "cursor", cursor: "abc123", limit: 20 };
```
