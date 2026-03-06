[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / EntityOperationDef

# Interface: EntityOperationDef\<TInput, TOutput\>

Defined in: [packages/contract/src/types.ts:217](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L217)

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

`TOutput` = `unknown`

Zod schema for the response payload.

## Properties

### contentType?

> `optional` **contentType**: `"json"` \| `"multipart"`

Defined in: [packages/contract/src/types.ts:240](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L240)

Content type for the request body. Defaults to `"json"`.

***

### input?

> `optional` **input**: `TInput`

Defined in: [packages/contract/src/types.ts:228](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L228)

Zod schema validating the request payload. Optional for GET/DELETE operations.

***

### invalidates()?

> `optional` **invalidates**: (`queryKeys`, `params`) => readonly `unknown`[][]

Defined in: [packages/contract/src/types.ts:235](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L235)

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

Defined in: [packages/contract/src/types.ts:222](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L222)

HTTP method for this operation.

***

### output?

> `optional` **output**: `TOutput`

Defined in: [packages/contract/src/types.ts:230](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L230)

Zod schema validating the response payload. When omitted, falls back to the entity's `schema`.

***

### path

> **path**: `string`

Defined in: [packages/contract/src/types.ts:224](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L224)

URL path with optional `:paramName` placeholders (e.g. `"/products/:id"`).

***

### responseType?

> `optional` **responseType**: `"json"` \| `"blob"`

Defined in: [packages/contract/src/types.ts:242](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L242)

Expected response format. Defaults to `"json"`.

***

### role?

> `optional` **role**: [`CrudRole`](../type-aliases/CrudRole.md)

Defined in: [packages/contract/src/types.ts:226](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L226)

CRUD role. When omitted, inferred from the operation name if it matches a standard CRUD name.

***

### transformRequest()?

> `optional` **transformRequest**: (`input`, `url`) => [`TransformedRequest`](TransformedRequest.md)

Defined in: [packages/contract/src/types.ts:247](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L247)

Transforms the input into a custom HTTP request.
When provided, replaces the default JSON body serialization.

#### Parameters

##### input

`unknown`

##### url

`string`

#### Returns

[`TransformedRequest`](TransformedRequest.md)

***

### transformResponse()?

> `optional` **transformResponse**: (`raw`) => `unknown`

Defined in: [packages/contract/src/types.ts:252](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L252)

Transforms the raw API response before returning to the caller.
Useful for mapping server field names to client-side conventions.

#### Parameters

##### raw

`unknown`

#### Returns

`unknown`
