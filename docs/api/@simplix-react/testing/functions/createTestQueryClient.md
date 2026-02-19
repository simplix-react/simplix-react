[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/testing](../README.md) / createTestQueryClient

# Function: createTestQueryClient()

> **createTestQueryClient**(): [`QueryClient`](https://tanstack.com/query/latest/docs/reference/QueryClient)

Defined in: [test-query-client.ts:30](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/testing/src/test-query-client.ts#L30)

Creates a [QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient) pre-configured for deterministic test execution.

## Returns

[`QueryClient`](https://tanstack.com/query/latest/docs/reference/QueryClient)

A [QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient) instance with test-optimized defaults.

## Remarks

The returned client disables retries, garbage-collection time, and stale time
so that queries resolve immediately and do not leak state between tests.

Default options applied:

- `queries.retry` → `false`
- `queries.gcTime` → `0`
- `queries.staleTime` → `0`
- `mutations.retry` → `false`

## Example

```ts
import { createTestQueryClient } from "@simplix-react/testing";

const queryClient = createTestQueryClient();

afterEach(() => {
  queryClient.clear();
});
```
