[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / EntityClient

# Type Alias: EntityClient\<_TSchema, TOperations\>

> **EntityClient**\<`_TSchema`, `TOperations`\> = `{ [K in keyof TOperations]: (args: unknown[]) => Promise<unknown> }`

Defined in: [packages/contract/src/types.ts:388](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L388)

Provides a type-safe client for a single entity, derived from its
[EntityDefinition](../interfaces/EntityDefinition.md) operations.

Each operation in the entity produces a callable function on the client.
Function signatures vary by CRUD role and HTTP method.

## Type Parameters

### _TSchema

`_TSchema` *extends* `z.ZodType`

### TOperations

`TOperations` *extends* `Record`\<`string`, [`EntityOperationDef`](../interfaces/EntityOperationDef.md)\>

Map of operation names to their definitions.

## Type Param

Zod schema for the entity's response shape.

## Example

```ts
import { defineApi } from "@simplix-react/contract";

const api = defineApi(config);

// Standard CRUD operations
const products = await api.client.product.list();
const product = await api.client.product.get("product-1");
const created = await api.client.product.create({ name: "New" });
const updated = await api.client.product.update("product-1", { name: "Updated" });
await api.client.product.delete("product-1");

// Custom operations
await api.client.product.archive("product-1", { reason: "discontinued" });
```

## See

[deriveClient](../functions/deriveClient.md) for the factory function.
