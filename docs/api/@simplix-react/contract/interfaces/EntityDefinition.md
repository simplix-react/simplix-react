[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / EntityDefinition

# Interface: EntityDefinition\<TSchema, TCreate, TUpdate\>

Defined in: [packages/contract/src/types.ts:73](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/contract/src/types.ts#L73)

Defines a CRUD-capable API entity with Zod schemas for type-safe validation.

Serves as the single source of truth for an entity's shape, creation payload,
update payload, and URL structure. The framework derives API clients, React Query
hooks, and MSW handlers from this definition.

## Example

```ts
import { z } from "zod";
import type { EntityDefinition } from "@simplix-react/contract";

const taskEntity: EntityDefinition = {
  path: "/tasks",
  schema: z.object({ id: z.string(), title: z.string() }),
  createSchema: z.object({ title: z.string() }),
  updateSchema: z.object({ title: z.string().optional() }),
  parent: { param: "projectId", path: "/projects" },
};
```

## See

 - [OperationDefinition](OperationDefinition.md) for non-CRUD custom operations.
 - [deriveHooks](../../react/functions/deriveHooks.md) for deriving React Query hooks.
 - [deriveMockHandlers](../../mock/functions/deriveMockHandlers.md) for deriving MSW handlers.

## Type Parameters

### TSchema

`TSchema` *extends* `z.ZodType` = `z.ZodType`

Zod schema for the entity's response shape.

### TCreate

`TCreate` *extends* `z.ZodType` = `z.ZodType`

Zod schema for the creation payload.

### TUpdate

`TUpdate` *extends* `z.ZodType` = `z.ZodType`

Zod schema for the update (partial) payload.

## Properties

### createSchema

> **createSchema**: `TCreate`

Defined in: [packages/contract/src/types.ts:83](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/contract/src/types.ts#L83)

Zod schema describing the payload required to create a new entity.

***

### filterSchema?

> `optional` **filterSchema**: `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

Defined in: [packages/contract/src/types.ts:91](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/contract/src/types.ts#L91)

Optional Zod schema for validating list filter parameters.

***

### parent?

> `optional` **parent**: [`EntityParent`](EntityParent.md)

Defined in: [packages/contract/src/types.ts:87](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/contract/src/types.ts#L87)

Optional parent resource for nested URL construction.

***

### path

> **path**: `string`

Defined in: [packages/contract/src/types.ts:79](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/contract/src/types.ts#L79)

URL path segment for this entity (e.g. `"/tasks"`).

***

### queries?

> `optional` **queries**: `Record`\<`string`, [`EntityQuery`](EntityQuery.md)\>

Defined in: [packages/contract/src/types.ts:89](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/contract/src/types.ts#L89)

Named query scopes for filtering entities by parent relationships.

***

### schema

> **schema**: `TSchema`

Defined in: [packages/contract/src/types.ts:81](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/contract/src/types.ts#L81)

Zod schema describing the full entity shape returned by the API.

***

### updateSchema

> **updateSchema**: `TUpdate`

Defined in: [packages/contract/src/types.ts:85](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/contract/src/types.ts#L85)

Zod schema describing the payload for updating an existing entity.
