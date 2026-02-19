[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / EntityOperationDef

# Interface: EntityOperationDef\<TInput, TOutput\>

Defined in: [packages/contract/src/types.ts:83](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/contract/src/types.ts#L83)

Defines a single API operation within an entity.

Each operation maps to a specific HTTP endpoint. Operations can have
a CRUD role (auto-mapped by name or explicitly set) that determines
how the framework derives hooks, mock handlers, and client methods.

## Example

```ts
import { z } from "zod";
import type { EntityOperationDef } from "@simplix-react/contract";

const listOp: EntityOperationDef = {
  method: "GET",
  path: "/products",
};

const archiveOp: EntityOperationDef = {
  method: "POST",
  path: "/products/:id/archive",
  input: z.object({ reason: z.string() }),
};
```

## See

[EntityDefinition.operations](EntityDefinition.md#operations) where these are declared.

## Type Parameters

### TInput

`TInput` *extends* `z.ZodType` = `z.ZodType`

Zod schema for the request payload.

### TOutput

`TOutput` *extends* `z.ZodType` = `z.ZodType`

Zod schema for the response payload.

## Properties

### contentType?

> `optional` **contentType**: `"json"` \| `"multipart"`

Defined in: [packages/contract/src/types.ts:106](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/contract/src/types.ts#L106)

Content type for the request body. Defaults to `"json"`.

***

### input?

> `optional` **input**: `TInput`

Defined in: [packages/contract/src/types.ts:94](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/contract/src/types.ts#L94)

Zod schema validating the request payload. Optional for GET/DELETE operations.

***

### invalidates()?

> `optional` **invalidates**: (`queryKeys`, `params`) => readonly `unknown`[][]

Defined in: [packages/contract/src/types.ts:101](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/contract/src/types.ts#L101)

Returns query key arrays that should be invalidated after this operation succeeds.
Enables automatic cache invalidation in `@simplix-react/react`.

#### Parameters

##### queryKeys

`Record`\<`string`, [`QueryKeyFactory`](QueryKeyFactory.md)\>

##### params

`Record`\<`string`, `string`\>

#### Returns

readonly `unknown`[][]

***

### method

> **method**: [`HttpMethod`](../type-aliases/HttpMethod.md)

Defined in: [packages/contract/src/types.ts:88](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/contract/src/types.ts#L88)

HTTP method for this operation.

***

### output?

> `optional` **output**: `TOutput`

Defined in: [packages/contract/src/types.ts:96](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/contract/src/types.ts#L96)

Zod schema validating the response payload. When omitted, falls back to the entity's `schema`.

***

### path

> **path**: `string`

Defined in: [packages/contract/src/types.ts:90](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/contract/src/types.ts#L90)

URL path with optional `:paramName` placeholders (e.g. `"/products/:id"`).

***

### responseType?

> `optional` **responseType**: `"json"` \| `"blob"`

Defined in: [packages/contract/src/types.ts:108](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/contract/src/types.ts#L108)

Expected response format. Defaults to `"json"`.

***

### role?

> `optional` **role**: [`CrudRole`](../type-aliases/CrudRole.md)

Defined in: [packages/contract/src/types.ts:92](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/contract/src/types.ts#L92)

CRUD role. When omitted, inferred from the operation name if it matches a standard CRUD name.
