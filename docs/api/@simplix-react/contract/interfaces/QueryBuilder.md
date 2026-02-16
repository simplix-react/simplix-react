[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / QueryBuilder

# Interface: QueryBuilder

Defined in: [packages/contract/src/helpers/query-types.ts:124](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/contract/src/helpers/query-types.ts#L124)

Defines how list parameters are serialized to URL search params and how
pagination metadata is extracted from API responses.

Implement this interface to adapt the framework to your API's query string
conventions. Use [simpleQueryBuilder](../variables/simpleQueryBuilder.md) as a ready-made implementation
for common REST patterns.

## Example

```ts
import type { QueryBuilder } from "@simplix-react/contract";

const customQueryBuilder: QueryBuilder = {
  buildSearchParams(params) {
    const sp = new URLSearchParams();
    if (params.pagination?.type === "offset") {
      sp.set("offset", String((params.pagination.page - 1) * params.pagination.limit));
      sp.set("limit", String(params.pagination.limit));
    }
    return sp;
  },
  parsePageInfo(response) {
    const { total, nextCursor } = response as any;
    return { total, hasNextPage: !!nextCursor, nextCursor };
  },
};
```

## See

[simpleQueryBuilder](../variables/simpleQueryBuilder.md) for the built-in implementation.

## Methods

### buildSearchParams()

> **buildSearchParams**(`params`): `URLSearchParams`

Defined in: [packages/contract/src/helpers/query-types.ts:126](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/contract/src/helpers/query-types.ts#L126)

Converts structured list parameters into URL search params.

#### Parameters

##### params

[`ListParams`](ListParams.md)

#### Returns

`URLSearchParams`

***

### parsePageInfo()?

> `optional` **parsePageInfo**(`response`): [`PageInfo`](PageInfo.md)

Defined in: [packages/contract/src/helpers/query-types.ts:128](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/contract/src/helpers/query-types.ts#L128)

Extracts pagination metadata from an API response (optional).

#### Parameters

##### response

`unknown`

#### Returns

[`PageInfo`](PageInfo.md)
