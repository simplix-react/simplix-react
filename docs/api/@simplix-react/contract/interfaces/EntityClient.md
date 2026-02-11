[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / EntityClient

# Interface: EntityClient\<TSchema, TCreate, TUpdate\>

Defined in: packages/contract/src/types.ts:272

Provides a type-safe CRUD client for a single entity, derived from its
[EntityDefinition](EntityDefinition.md) schemas.

All methods infer request/response types directly from the Zod schemas,
ensuring compile-time safety without manual type annotations.

## Example

```ts
import { defineApi } from "@simplix-react/contract";

const api = defineApi(config);

// All methods are fully typed based on entity schemas
const tasks = await api.client.task.list();
const task = await api.client.task.get("task-1");
const created = await api.client.task.create({ title: "New task" });
const updated = await api.client.task.update("task-1", { title: "Updated" });
await api.client.task.delete("task-1");
```

## See

[deriveClient](../functions/deriveClient.md) for the factory function.

## Type Parameters

### TSchema

`TSchema` *extends* `z.ZodType`

Zod schema for the entity's response shape.

### TCreate

`TCreate` *extends* `z.ZodType`

Zod schema for the creation payload.

### TUpdate

`TUpdate` *extends* `z.ZodType`

Zod schema for the update payload.

## Properties

### create()

> **create**: (`parentIdOrDto`, `dto?`) => `Promise`\<`output`\<`TSchema`\>\>

Defined in: packages/contract/src/types.ts:285

Creates a new entity, optionally under a parent resource.

#### Parameters

##### parentIdOrDto

`string` | `output`\<`TCreate`\>

##### dto?

`output`\<`TCreate`\>

#### Returns

`Promise`\<`output`\<`TSchema`\>\>

***

### delete()

> **delete**: (`id`) => `Promise`\<`void`\>

Defined in: packages/contract/src/types.ts:292

Deletes an entity by its ID.

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**: (`id`) => `Promise`\<`output`\<`TSchema`\>\>

Defined in: packages/contract/src/types.ts:283

Fetches a single entity by its ID.

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`output`\<`TSchema`\>\>

***

### list()

> **list**: (`parentIdOrParams?`, `params?`) => `Promise`\<`output`\<`TSchema`\>[]\>

Defined in: packages/contract/src/types.ts:278

Fetches a list of entities, optionally scoped by parent ID and/or list parameters.

#### Parameters

##### parentIdOrParams?

`string` | [`ListParams`](ListParams.md)\<`Record`\<`string`, `unknown`\>\>

##### params?

[`ListParams`](ListParams.md)\<`Record`\<`string`, `unknown`\>\>

#### Returns

`Promise`\<`output`\<`TSchema`\>[]\>

***

### update()

> **update**: (`id`, `dto`) => `Promise`\<`output`\<`TSchema`\>\>

Defined in: packages/contract/src/types.ts:290

Partially updates an existing entity by ID.

#### Parameters

##### id

`string`

##### dto

`output`\<`TUpdate`\>

#### Returns

`Promise`\<`output`\<`TSchema`\>\>
