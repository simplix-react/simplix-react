[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / QueryKeyFactory

# Interface: QueryKeyFactory

Defined in: [packages/contract/src/types.ts:558](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L558)

Provides structured query key generators for a single entity, following the
query key factory pattern recommended by TanStack Query.

Generated automatically by [deriveQueryKeys](../functions/deriveQueryKeys.md) and used by `@simplix-react/react`
to manage cache granularity and invalidation.

## Example

```ts
import { defineApi } from "@simplix-react/contract";

const api = defineApi(config);

api.queryKeys.product.all;                     // ["inventory", "product"]
api.queryKeys.product.lists();                 // ["inventory", "product", "list"]
api.queryKeys.product.list({ status: "active" }); // ["inventory", "product", "list", { status: "active" }]
api.queryKeys.product.details();               // ["inventory", "product", "detail"]
api.queryKeys.product.detail("abc");           // ["inventory", "product", "detail", "abc"]
api.queryKeys.product.trees();                 // ["inventory", "product", "tree"]
api.queryKeys.product.tree({ rootId: "x" });   // ["inventory", "product", "tree", { rootId: "x" }]
```

## See

[deriveQueryKeys](../functions/deriveQueryKeys.md) for the factory function.

## Properties

### all

> **all**: readonly `unknown`[]

Defined in: [packages/contract/src/types.ts:560](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L560)

Root key matching all queries for this entity: `[domain, entity]`.

***

### detail()

> **detail**: (`id`) => readonly `unknown`[]

Defined in: [packages/contract/src/types.ts:568](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L568)

Returns key matching a specific detail query by ID.

#### Parameters

##### id

[`EntityId`](../type-aliases/EntityId.md)

#### Returns

readonly `unknown`[]

***

### details()

> **details**: () => readonly `unknown`[]

Defined in: [packages/contract/src/types.ts:566](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L566)

Returns key matching all detail queries: `[domain, entity, "detail"]`.

#### Returns

readonly `unknown`[]

***

### list()

> **list**: (`params`) => readonly `unknown`[]

Defined in: [packages/contract/src/types.ts:564](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L564)

Returns key matching a specific list query with parameters.

#### Parameters

##### params

`Record`\<`string`, `unknown`\>

#### Returns

readonly `unknown`[]

***

### lists()

> **lists**: () => readonly `unknown`[]

Defined in: [packages/contract/src/types.ts:562](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L562)

Returns key matching all list queries: `[domain, entity, "list"]`.

#### Returns

readonly `unknown`[]

***

### tree()

> **tree**: (`params?`) => readonly `unknown`[]

Defined in: [packages/contract/src/types.ts:572](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L572)

Returns key matching a specific tree query with parameters.

#### Parameters

##### params?

`Record`\<`string`, `unknown`\>

#### Returns

readonly `unknown`[]

***

### trees()

> **trees**: () => readonly `unknown`[]

Defined in: [packages/contract/src/types.ts:570](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L570)

Returns key matching all tree queries: `[domain, entity, "tree"]`.

#### Returns

readonly `unknown`[]
