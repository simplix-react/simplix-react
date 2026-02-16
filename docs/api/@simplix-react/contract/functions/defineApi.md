[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / defineApi

# Function: defineApi()

> **defineApi**\<`TEntities`, `TOperations`\>(`config`, `options?`): `object`

Defined in: [packages/contract/src/define-api.ts:58](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/contract/src/define-api.ts#L58)

Creates a fully-typed API contract from an [ApiContractConfig](../interfaces/ApiContractConfig.md).

Serves as the main entry point for `@simplix-react/contract`. Takes a
declarative config of entities and operations, then derives a type-safe
HTTP client and query key factories. The returned contract is consumed
by `@simplix-react/react` for hooks and `@simplix-react/mock` for MSW handlers.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, [`EntityDefinition`](../interfaces/EntityDefinition.md)\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\>

Map of entity names to their [EntityDefinition](../interfaces/EntityDefinition.md)s.

### TOperations

`TOperations` *extends* `Record`\<`string`, [`OperationDefinition`](../interfaces/OperationDefinition.md)\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\> = `Record`\<`string`, `never`\>

Map of operation names to their [OperationDefinition](../interfaces/OperationDefinition.md)s.

## Parameters

### config

[`ApiContractConfig`](../interfaces/ApiContractConfig.md)\<`TEntities`, `TOperations`\>

The API contract configuration defining entities, operations, and shared settings.

### options?

Optional settings for customizing the contract.

#### fetchFn?

[`FetchFn`](../type-aliases/FetchFn.md)

Custom fetch function replacing the built-in [defaultFetch](defaultFetch.md).

## Returns

`object`

An [ApiContract](../interfaces/ApiContract.md) containing `config`, `client`, and `queryKeys`.

### client

> **client**: `Record`\<`string`, `unknown`\>

### config

> **config**: [`ApiContractConfig`](../interfaces/ApiContractConfig.md)\<`TEntities`, `TOperations`\>

### queryKeys

> **queryKeys**: \{ \[K in string \| number \| symbol\]: QueryKeyFactory \}

## Example

```ts
import { z } from "zod";
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";

const projectApi = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({ id: z.string(), title: z.string() }),
      createSchema: z.object({ title: z.string() }),
      updateSchema: z.object({ title: z.string().optional() }),
    },
  },
  queryBuilder: simpleQueryBuilder,
});

// Type-safe client usage
const tasks = await projectApi.client.task.list();
const task = await projectApi.client.task.get("task-1");

// Query keys for TanStack Query
projectApi.queryKeys.task.all;       // ["project", "task"]
projectApi.queryKeys.task.detail("task-1"); // ["project", "task", "detail", "task-1"]
```

## See

 - [ApiContractConfig](../interfaces/ApiContractConfig.md) for the full config shape.
 - [deriveHooks](../../react/functions/deriveHooks.md) for deriving React Query hooks.
 - [deriveMockHandlers](../../mock/functions/deriveMockHandlers.md) for deriving MSW handlers.
