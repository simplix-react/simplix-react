[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / EntityDefinition

# Interface: EntityDefinition\<TSchema, TOperations\>

Defined in: [packages/contract/src/types.ts:364](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L364)

Defines an API entity with a flexible operations map.

Each entity groups related API operations under a logical name. Operations
can include standard CRUD endpoints and any number of custom actions.
The framework derives clients, hooks, mock handlers, and form hooks
from this definition.

## Example

```ts
import { z } from "zod";
import type { EntityDefinition } from "@simplix-react/contract";

const productEntity: EntityDefinition = {
  schema: z.object({ id: z.string(), name: z.string(), price: z.number() }),
  operations: {
    list:   { method: "GET",    path: "/products" },
    get:    { method: "GET",    path: "/products/:id" },
    create: { method: "POST",   path: "/products", input: createSchema },
    update: { method: "PUT",    path: "/products/:id", input: updateSchema },
    delete: { method: "DELETE", path: "/products/:id" },
    archive: { method: "POST",  path: "/products/:id/archive", input: archiveSchema },
  },
};
```

## See

 - [EntityOperationDef](EntityOperationDef.md) for individual operation definitions.
 - [OperationDefinition](OperationDefinition.md) for standalone (non-entity) operations.

## Type Parameters

### TSchema

`TSchema` *extends* `z.ZodType` = `z.ZodType`

Zod schema for the entity's response shape.

### TOperations

`TOperations` *extends* `Record`\<`string`, [`EntityOperationDef`](EntityOperationDef.md)\> = `Record`\<`string`, [`EntityOperationDef`](EntityOperationDef.md)\>

Map of operation names to their definitions.

## Properties

### filterSchema?

> `optional` **filterSchema**: `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

Defined in: [packages/contract/src/types.ts:379](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L379)

Optional Zod schema for validating list filter parameters.

***

### identity?

> `optional` **identity**: `string`[]

Defined in: [packages/contract/src/types.ts:371](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L371)

Identity field names for cache key management. Defaults to `["id"]`.

***

### operations

> **operations**: `TOperations`

Defined in: [packages/contract/src/types.ts:373](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L373)

Map of operation names to their definitions.

***

### parent?

> `optional` **parent**: [`EntityParent`](EntityParent.md)

Defined in: [packages/contract/src/types.ts:375](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L375)

Optional parent resource for nested URL construction.

***

### queries?

> `optional` **queries**: `Record`\<`string`, [`EntityQuery`](EntityQuery.md)\>

Defined in: [packages/contract/src/types.ts:377](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L377)

Named query scopes for filtering entities by parent relationships.

***

### schema

> **schema**: `TSchema`

Defined in: [packages/contract/src/types.ts:369](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L369)

Zod schema describing the full entity shape returned by the API.
