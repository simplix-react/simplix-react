[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / PageInfo

# Interface: PageInfo

Defined in: [packages/contract/src/helpers/query-types.ts:85](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/contract/src/helpers/query-types.ts#L85)

Describes pagination metadata returned from the server.

Used by [QueryBuilder.parsePageInfo](QueryBuilder.md#parsepageinfo) to extract pagination state
from API responses, enabling infinite scroll and paginated UIs.

## Example

```ts
import type { PageInfo } from "@simplix-react/contract";

const pageInfo: PageInfo = {
  total: 42,
  hasNextPage: true,
  nextCursor: "cursor-xyz",
};
```

## Properties

### hasNextPage

> **hasNextPage**: `boolean`

Defined in: [packages/contract/src/helpers/query-types.ts:89](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/contract/src/helpers/query-types.ts#L89)

Whether more items exist beyond the current page.

***

### nextCursor?

> `optional` **nextCursor**: `string`

Defined in: [packages/contract/src/helpers/query-types.ts:91](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/contract/src/helpers/query-types.ts#L91)

Cursor value to fetch the next page (cursor-based pagination only).

***

### total?

> `optional` **total**: `number`

Defined in: [packages/contract/src/helpers/query-types.ts:87](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/contract/src/helpers/query-types.ts#L87)

Total number of items across all pages (if the server provides it).
