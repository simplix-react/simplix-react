[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / EntityClient

# Type Alias: EntityClient\<TSchema, TOperations\>

> **EntityClient**\<`TSchema`, `TOperations`\> = `{ [K in keyof TOperations & string]: EntityClientFn<ResolveRole<K, TOperations[K]>, TOperations[K], TSchema> }`

Defined in: [packages/contract/src/types.ts:604](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L604)

Provides a type-safe client for a single entity, derived from its
[EntityDefinition](../interfaces/EntityDefinition.md) operations.

Each operation in the entity produces a callable function on the client.
Function signatures vary by CRUD role and HTTP method.

## Type Parameters

### TSchema

`TSchema` *extends* `z.ZodType`

Zod schema for the entity's response shape.

### TOperations

`TOperations` *extends* `Record`\<`string`, [`EntityOperationDef`](../interfaces/EntityOperationDef.md)\>

Map of operation names to their definitions.

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
