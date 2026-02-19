[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / ListParams

# Interface: ListParams\<TFilters\>

Defined in: [packages/contract/src/helpers/query-types.ts:59](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/helpers/query-types.ts#L59)

Encapsulates all list query parameters: filters, sorting, and pagination.

Passed to entity `list()` methods and serialized into URL search params
by a [QueryBuilder](QueryBuilder.md).

## Example

```ts
import type { ListParams } from "@simplix-react/contract";

const params: ListParams = {
  filters: { status: "active" },
  sort: { field: "title", direction: "asc" },
  pagination: { type: "offset", page: 1, limit: 10 },
};

await api.client.task.list(params);
```

## Type Parameters

### TFilters

`TFilters` = `Record`\<`string`, `unknown`\>

Shape of the filter object, defaults to `Record<string, unknown>`.

## Properties

### filters?

> `optional` **filters**: `TFilters`

Defined in: [packages/contract/src/helpers/query-types.ts:61](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/helpers/query-types.ts#L61)

Optional filter criteria applied to the list query.

***

### pagination?

> `optional` **pagination**: [`PaginationParam`](../type-aliases/PaginationParam.md)

Defined in: [packages/contract/src/helpers/query-types.ts:65](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/helpers/query-types.ts#L65)

Pagination strategy and parameters.

***

### sort?

> `optional` **sort**: [`SortParam`](SortParam.md) \| [`SortParam`](SortParam.md)[]

Defined in: [packages/contract/src/helpers/query-types.ts:63](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/helpers/query-types.ts#L63)

Single sort directive or array of sort directives.
