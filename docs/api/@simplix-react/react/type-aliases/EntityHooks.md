[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / EntityHooks

# Type Alias: EntityHooks\<TSchema, TOperations\>

> **EntityHooks**\<`TSchema`, `TOperations`\> = `` { [K in keyof TOperations & string as `use${Capitalize<K>}`]: EntityHookFor<ResolveRole<K, TOperations[K]>, TOperations[K], TSchema> } `` & `EntityHasListRole`\<`TOperations`\> *extends* `true` ? `object` : `Record`\<`never`, `never`\>

Defined in: [types.ts:260](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L260)

The complete set of React Query hooks derived from an entity definition.

Each entity in the contract produces an object conforming to this type. Hook
names are derived from operation keys with a `use` prefix and PascalCase
(`list` → `useList`, custom `archive` → `useArchive`). CRUD-role operations
produce specialized, fully-typed hooks; custom operations produce generic
query (GET) or mutation hooks. A `list`-role operation additionally yields a
`useInfiniteList` hook.

## Type Parameters

### TSchema

`TSchema` *extends* `z.ZodTypeAny` = `z.ZodTypeAny`

The Zod schema defining the entity shape

### TOperations

`TOperations` *extends* `Record`\<`string`, `EntityOperationDef`\> = `Record`\<`string`, `EntityOperationDef`\>

The entity's operations map (drives hook names and types)

## Example

```ts
import { deriveEntityHooks } from "@simplix-react/react";

const hooks = deriveEntityHooks(inventoryContract);

const { data } = hooks.product.useList();          // UseQueryResult<Product[]>
const { data: single } = hooks.product.useGet(id); // UseQueryResult<Product>
const create = hooks.product.useCreate();          // UseMutationResult<Product, Error, CreateInput>
const archive = hooks.product.useArchive();        // custom operation hook
```

## See

[deriveEntityHooks](../functions/deriveEntityHooks.md) for generating these hooks from a contract.
