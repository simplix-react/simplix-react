[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / QueryKeyFactory

# Interface: QueryKeyFactory

Defined in: [packages/contract/src/types.ts:342](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L342)

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

Defined in: [packages/contract/src/types.ts:344](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L344)

Root key matching all queries for this entity: `[domain, entity]`.

***

### detail()

> **detail**: (`id`) => readonly `unknown`[]

Defined in: [packages/contract/src/types.ts:352](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L352)

Returns key matching a specific detail query by ID.

#### Parameters

##### id

[`EntityId`](../type-aliases/EntityId.md)

#### Returns

readonly `unknown`[]

***

### details()

> **details**: () => readonly `unknown`[]

Defined in: [packages/contract/src/types.ts:350](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L350)

Returns key matching all detail queries: `[domain, entity, "detail"]`.

#### Returns

readonly `unknown`[]

***

### list()

> **list**: (`params`) => readonly `unknown`[]

Defined in: [packages/contract/src/types.ts:348](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L348)

Returns key matching a specific list query with parameters.

#### Parameters

##### params

`Record`\<`string`, `unknown`\>

#### Returns

readonly `unknown`[]

***

### lists()

> **lists**: () => readonly `unknown`[]

Defined in: [packages/contract/src/types.ts:346](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L346)

Returns key matching all list queries: `[domain, entity, "list"]`.

#### Returns

readonly `unknown`[]

***

### tree()

> **tree**: (`params?`) => readonly `unknown`[]

Defined in: [packages/contract/src/types.ts:356](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L356)

Returns key matching a specific tree query with parameters.

#### Parameters

##### params?

`Record`\<`string`, `unknown`\>

#### Returns

readonly `unknown`[]

***

### trees()

> **trees**: () => readonly `unknown`[]

Defined in: [packages/contract/src/types.ts:354](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L354)

Returns key matching all tree queries: `[domain, entity, "tree"]`.

#### Returns

readonly `unknown`[]
