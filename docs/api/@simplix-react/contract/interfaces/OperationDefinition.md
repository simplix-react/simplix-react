[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / OperationDefinition

# Interface: OperationDefinition\<TInput, TOutput\>

Defined in: [packages/contract/src/types.ts:374](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L374)

Defines a custom (non-CRUD) API operation with typed input and output.

Covers endpoints that do not fit the entity pattern, such as
file uploads, batch operations, or RPC-style calls. Path parameters use
the `:paramName` syntax and are positionally mapped to function arguments.

## Example

```ts
import { z } from "zod";
import type { OperationDefinition } from "@simplix-react/contract";

const assignTask: OperationDefinition = {
  method: "POST",
  path: "/tasks/:taskId/assign",
  input: z.object({ userId: z.string() }),
  output: z.object({ id: z.string(), assigneeId: z.string() }),
};
```

## See

[EntityOperationDef](EntityOperationDef.md) for operations inside an entity.

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

Defined in: [packages/contract/src/types.ts:387](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L387)

Content type for the request body. Defaults to `"json"`.

***

### input

> **input**: `TInput`

Defined in: [packages/contract/src/types.ts:383](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L383)

Zod schema validating the request payload.

***

### invalidates()?

> `optional` **invalidates**: (`queryKeys`, `params`) => readonly `unknown`[][]

Defined in: [packages/contract/src/types.ts:394](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L394)

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

Defined in: [packages/contract/src/types.ts:379](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L379)

HTTP method for this operation.

***

### output

> **output**: `TOutput`

Defined in: [packages/contract/src/types.ts:385](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L385)

Zod schema validating the response payload.

***

### path

> **path**: `string`

Defined in: [packages/contract/src/types.ts:381](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L381)

URL path with optional `:paramName` placeholders (e.g. `"/tasks/:taskId/assign"`).

***

### responseType?

> `optional` **responseType**: `"json"` \| `"blob"`

Defined in: [packages/contract/src/types.ts:389](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L389)

Expected response format. Defaults to `"json"`.

***

### transformRequest()?

> `optional` **transformRequest**: (`input`, `url`) => [`TransformedRequest`](TransformedRequest.md)

Defined in: [packages/contract/src/types.ts:402](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L402)

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

Defined in: [packages/contract/src/types.ts:407](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L407)

Transforms the raw API response before returning to the caller.
Useful for mapping server field names to client-side conventions.

#### Parameters

##### raw

`unknown`

#### Returns

`unknown`
