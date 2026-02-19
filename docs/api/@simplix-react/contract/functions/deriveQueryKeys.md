[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / deriveQueryKeys

# Function: deriveQueryKeys()

> **deriveQueryKeys**\<`TEntities`\>(`config`): \{ \[K in string \| number \| symbol\]: QueryKeyFactory \}

Defined in: [packages/contract/src/derive/query-keys.ts:38](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/derive/query-keys.ts#L38)

Derives a set of [QueryKeyFactory](../interfaces/QueryKeyFactory.md) instances for all entities in a contract.

Generates structured query keys following the factory pattern recommended
by TanStack Query. Each entity receives keys scoped by `[domain, entityName]`,
enabling granular cache invalidation (e.g. invalidate all product lists without
affecting product details).

Typically called internally by [defineApi](defineApi.md) rather than used directly.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, [`EntityDefinition`](../interfaces/EntityDefinition.md)\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `Record`\<`string`, [`EntityOperationDef`](../interfaces/EntityOperationDef.md)\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\>\>\>

Map of entity names to their definitions.

## Parameters

### config

`Pick`\<[`ApiContractConfig`](../interfaces/ApiContractConfig.md)\<`TEntities`\>, `"domain"` \| `"entities"`\>

Subset of the API contract config containing `domain` and `entities`.

## Returns

\{ \[K in string \| number \| symbol\]: QueryKeyFactory \}

A map of entity names to their [QueryKeyFactory](../interfaces/QueryKeyFactory.md) instances.

## Example

```ts
import { deriveQueryKeys } from "@simplix-react/contract";

const queryKeys = deriveQueryKeys({ domain: "inventory", entities: { product: productEntity } });

queryKeys.product.all;              // ["inventory", "product"]
queryKeys.product.lists();          // ["inventory", "product", "list"]
queryKeys.product.detail("abc");    // ["inventory", "product", "detail", "abc"]
queryKeys.product.trees();          // ["inventory", "product", "tree"]
queryKeys.product.tree({ rootId: "x" }); // ["inventory", "product", "tree", { rootId: "x" }]
```

## See

 - [defineApi](defineApi.md) for the recommended high-level API.
 - [QueryKeyFactory](../interfaces/QueryKeyFactory.md) for the generated key structure.
