[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / QueryKeyFactory

# Interface: QueryKeyFactory

Defined in: [packages/contract/src/types.ts:232](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/contract/src/types.ts#L232)

Provides structured query key generators for a single entity, following the
query key factory pattern recommended by TanStack Query.

Generated automatically by [deriveQueryKeys](../functions/deriveQueryKeys.md) and used by `@simplix-react/react`
to manage cache granularity and invalidation.

## Example

```ts
import { defineApi } from "@simplix-react/contract";

const api = defineApi(config);

api.queryKeys.task.all;              // ["project", "task"]
api.queryKeys.task.lists();          // ["project", "task", "list"]
api.queryKeys.task.list({ status: "open" }); // ["project", "task", "list", { status: "open" }]
api.queryKeys.task.details();        // ["project", "task", "detail"]
api.queryKeys.task.detail("abc");    // ["project", "task", "detail", "abc"]
```

## See

[deriveQueryKeys](../functions/deriveQueryKeys.md) for the factory function.

## Properties

### all

> **all**: readonly `unknown`[]

Defined in: [packages/contract/src/types.ts:234](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/contract/src/types.ts#L234)

Root key matching all queries for this entity: `[domain, entity]`.

***

### detail()

> **detail**: (`id`) => readonly `unknown`[]

Defined in: [packages/contract/src/types.ts:242](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/contract/src/types.ts#L242)

Returns key matching a specific detail query by ID.

#### Parameters

##### id

`string`

#### Returns

readonly `unknown`[]

***

### details()

> **details**: () => readonly `unknown`[]

Defined in: [packages/contract/src/types.ts:240](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/contract/src/types.ts#L240)

Returns key matching all detail queries: `[domain, entity, "detail"]`.

#### Returns

readonly `unknown`[]

***

### list()

> **list**: (`params`) => readonly `unknown`[]

Defined in: [packages/contract/src/types.ts:238](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/contract/src/types.ts#L238)

Returns key matching a specific list query with parameters.

#### Parameters

##### params

`Record`\<`string`, `unknown`\>

#### Returns

readonly `unknown`[]

***

### lists()

> **lists**: () => readonly `unknown`[]

Defined in: [packages/contract/src/types.ts:236](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/contract/src/types.ts#L236)

Returns key matching all list queries: `[domain, entity, "list"]`.

#### Returns

readonly `unknown`[]
