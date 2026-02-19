[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/testing](../README.md) / waitForQuery

# Function: waitForQuery()

> **waitForQuery**(`queryClient`, `queryKey`, `options?`): `Promise`\<`void`\>

Defined in: [wait-for-query.ts:35](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/testing/src/wait-for-query.ts#L35)

Polls the [QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient) until the given query key resolves to a
non-pending status.

## Parameters

### queryClient

[`QueryClient`](https://tanstack.com/query/latest/docs/reference/QueryClient)

The [QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient) instance that owns the query cache.

### queryKey

readonly `unknown`[]

The query key to observe.

### options?

Optional configuration.

#### timeout?

`number`

Maximum time (ms) to wait before throwing. Defaults to `5000`.

## Returns

`Promise`\<`void`\>

A promise that resolves when the query is no longer in `"pending"` status.

## Remarks

Useful when a test needs to wait for server state to settle before making
assertions, without relying on UI-level utilities such as `waitFor` from
`@testing-library/react`.

The function polls every 10 ms and rejects with an error if the query has
not resolved within the specified timeout.

## Throws

If the query does not resolve within the timeout period.

## Example

```ts
import { createTestQueryClient, waitForQuery } from "@simplix-react/testing";

const queryClient = createTestQueryClient();

// ... trigger a query fetch ...

await waitForQuery(queryClient, ["users"]);
const data = queryClient.getQueryData(["users"]);
expect(data).toBeDefined();
```
