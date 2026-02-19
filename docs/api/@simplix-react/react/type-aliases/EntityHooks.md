[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / EntityHooks

# Type Alias: EntityHooks\<_TSchema\>

> **EntityHooks**\<`_TSchema`\> = `Record`\<`string`, (...`args`) => `unknown`\>

Defined in: [types.ts:193](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/react/src/types.ts#L193)

Represents the complete set of React Query hooks derived from an entity definition.

Each entity in the contract produces an object conforming to this interface.
Hook names are derived from operation names with a `use` prefix and PascalCase.
CRUD role operations produce specialized hooks; custom operations produce
generic query/mutation hooks based on their HTTP method.

## Type Parameters

### _TSchema

`_TSchema` *extends* `z.ZodTypeAny` = `z.ZodTypeAny`

## Type Param

The Zod schema defining the entity shape

## Example

```ts
import { deriveHooks } from "@simplix-react/react";

const hooks = deriveHooks(inventoryContract);

// CRUD hooks (from operations with CRUD roles)
const { data } = hooks.product.useList();
const { data: single } = hooks.product.useGet(id);
const create = hooks.product.useCreate();
const update = hooks.product.useUpdate();
const remove = hooks.product.useDelete();
const infinite = hooks.product.useInfiniteList();

// Custom operation hooks
const archive = hooks.product.useArchive();
const { data: results } = hooks.product.useSearch({ q: "keyword" });
```

## See

[deriveHooks](../functions/deriveHooks.md) for generating these hooks from a contract.
