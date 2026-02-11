[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / simpleQueryBuilder

# Variable: simpleQueryBuilder

> `const` **simpleQueryBuilder**: [`QueryBuilder`](../interfaces/QueryBuilder.md)

Defined in: [packages/contract/src/helpers/query-builders.ts:30](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/contract/src/helpers/query-builders.ts#L30)

Provides a straightforward [QueryBuilder](../interfaces/QueryBuilder.md) implementation for common REST APIs.

Serializes filters as flat key-value pairs, sort as `field:direction` comma-separated
values, and pagination as `page`/`limit` (offset) or `cursor`/`limit` (cursor-based).

## Example

```ts
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";

const api = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: { task: taskEntity },
  queryBuilder: simpleQueryBuilder,
});

// Produces: /api/v1/tasks?status=pending&sort=name:asc&page=1&limit=10
await api.client.task.list({
  filters: { status: "pending" },
  sort: { field: "name", direction: "asc" },
  pagination: { type: "offset", page: 1, limit: 10 },
});
```

## See

[QueryBuilder](../interfaces/QueryBuilder.md) for implementing custom serialization strategies.
