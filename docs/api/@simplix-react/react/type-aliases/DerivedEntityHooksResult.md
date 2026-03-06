[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / DerivedEntityHooksResult

# Type Alias: DerivedEntityHooksResult\<TEntities, TOperations\>

> **DerivedEntityHooksResult**\<`TEntities`, `TOperations`\> = `{ [K in keyof TEntities]: EntityHooks<TEntities[K]["schema"]> }` & `{ [K in keyof TOperations]: TOperations[K] extends OperationDefinition<infer TInput, infer TOutput> ? OperationHooks<TInput, TOutput> : never }`

Defined in: [derive-hooks.ts:560](https://github.com/simplix-react/simplix-react/blob/main/derive-hooks.ts#L560)

The fully typed return value of [deriveEntityHooks](../functions/deriveEntityHooks.md).

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, `AnyEntityDef`\>

Record of entity definitions from the contract

### TOperations

`TOperations` *extends* `Record`\<`string`, `AnyOperationDef`\>

Record of top-level operation definitions from the contract

## Remarks

Combines two mapped types:
- **Entity hooks** — for each entity key `K` in the contract, produces an
  [EntityHooks](EntityHooks.md) object with CRUD hooks (`useList`, `useGet`, `useCreate`,
  `useUpdate`, `useDelete`, `useInfiniteList`) and any custom operation hooks.
- **Operation hooks** — for each top-level operation key `K`, produces an
  [OperationHooks](../interfaces/OperationHooks.md) object with a `useMutation` hook.

## Example

```ts
import { deriveEntityHooks } from "@simplix-react/react";

const hooks = deriveEntityHooks(inventoryContract);
// hooks.product -> EntityHooks (useList, useGet, useCreate, ...)
// hooks.bulkImport -> OperationHooks (useMutation)
```
