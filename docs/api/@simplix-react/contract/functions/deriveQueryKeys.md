[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / deriveQueryKeys

# Function: deriveQueryKeys()

> **deriveQueryKeys**\<`TEntities`\>(`config`): \{ \[K in string \| number \| symbol\]: QueryKeyFactory \}

Defined in: [packages/contract/src/derive/query-keys.ts:35](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/contract/src/derive/query-keys.ts#L35)

Derives a set of [QueryKeyFactory](../interfaces/QueryKeyFactory.md) instances for all entities in a contract.

Generates structured query keys following the factory pattern recommended
by TanStack Query. Each entity receives keys scoped by `[domain, entityName]`,
enabling granular cache invalidation (e.g. invalidate all task lists without
affecting task details).

Typically called internally by [defineApi](defineApi.md) rather than used directly.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, [`EntityDefinition`](../interfaces/EntityDefinition.md)\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\>

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

const queryKeys = deriveQueryKeys({ domain: "project", entities: { task: taskEntity } });

queryKeys.task.all;              // ["project", "task"]
queryKeys.task.lists();          // ["project", "task", "list"]
queryKeys.task.detail("abc");    // ["project", "task", "detail", "abc"]
```

## See

 - [defineApi](defineApi.md) for the recommended high-level API.
 - [QueryKeyFactory](../interfaces/QueryKeyFactory.md) for the generated key structure.
