[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / deriveHooks

# Function: deriveHooks()

> **deriveHooks**\<`TEntities`, `TOperations`\>(`contract`): `DerivedHooksResult`\<`TEntities`, `TOperations`\>

Defined in: [derive-hooks.ts:72](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/react/src/derive-hooks.ts#L72)

Derives type-safe React Query hooks from an API contract.

Generates a complete set of hooks for every entity and operation defined in
the contract. Entity hooks include `useList`, `useGet`, `useCreate`,
`useUpdate`, `useDelete`, and `useInfiniteList`. Operation hooks provide
a single `useMutation` with automatic cache invalidation.

All hooks support full TanStack Query options passthrough — callers can
provide any option except `queryKey`/`queryFn` (for queries) or
`mutationFn` (for mutations), which are managed internally.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, `AnyEntityDef`\>

Record of entity definitions from the contract

### TOperations

`TOperations` *extends* `Record`\<`string`, `AnyOperationDef`\>

Record of operation definitions from the contract

## Parameters

### contract

The API contract produced by `defineApi()` from `@simplix-react/contract`,
  containing `config`, `client`, and `queryKeys`.

#### client

`Record`\<`string`, `unknown`\>

#### config

[`ApiContractConfig`](../@simplix-react/contract/interfaces/ApiContractConfig.md)\<`TEntities`, `TOperations`\>

#### queryKeys

`Record`\<`string`, `QueryKeyFactory`\>

## Returns

`DerivedHooksResult`\<`TEntities`, `TOperations`\>

An object keyed by entity/operation name, each containing its derived hooks.

## Example

```ts
import { defineApi } from "@simplix-react/contract";
import { deriveHooks } from "@simplix-react/react";
import { z } from "zod";

const projectContract = defineApi({
  domain: "project",
  basePath: "/api",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({ id: z.string(), title: z.string(), status: z.string() }),
      createSchema: z.object({ title: z.string(), status: z.string() }),
      updateSchema: z.object({ title: z.string().optional(), status: z.string().optional() }),
    },
  },
});

// Derive all hooks at once
const hooks = deriveHooks(projectContract);

// Use in components
function TaskList() {
  const { data: tasks } = hooks.task.useList();
  const createTask = hooks.task.useCreate();
  // ...
}
```

## See

 - [EntityHooks](../interfaces/EntityHooks.md) for the per-entity hook interface.
 - [OperationHooks](../interfaces/OperationHooks.md) for the per-operation hook interface.
