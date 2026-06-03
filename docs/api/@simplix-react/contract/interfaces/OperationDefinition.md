[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / OperationDefinition

# Interface: OperationDefinition\<TInput, TOutput\>

Defined in: [packages/contract/src/types.ts:436](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L436)

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

Defined in: [packages/contract/src/types.ts:449](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L449)

Content type for the request body. Defaults to `"json"`.

***

### input

> **input**: `TInput`

Defined in: [packages/contract/src/types.ts:445](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L445)

Zod schema validating the request payload.

***

### invalidates()?

> `optional` **invalidates**: (`queryKeys`, `params`) => readonly readonly `unknown`[][]

Defined in: [packages/contract/src/types.ts:456](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L456)

Returns query key arrays that should be invalidated after this operation succeeds.
Enables automatic cache invalidation in `@simplix-react/react`.

#### Parameters

##### queryKeys

`Record`\<`string`, [`QueryKeyFactory`](QueryKeyFactory.md)\>

##### params

`Record`\<`string`, `string`\>

#### Returns

readonly readonly `unknown`[][]

***

### method

> **method**: [`HttpMethod`](../type-aliases/HttpMethod.md)

Defined in: [packages/contract/src/types.ts:441](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L441)

HTTP method for this operation.

***

### output

> **output**: `TOutput`

Defined in: [packages/contract/src/types.ts:447](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L447)

Zod schema validating the response payload.

***

### path

> **path**: `string`

Defined in: [packages/contract/src/types.ts:443](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L443)

URL path with optional `:paramName` placeholders (e.g. `"/tasks/:taskId/assign"`).

***

### responseType?

> `optional` **responseType**: `"json"` \| `"blob"`

Defined in: [packages/contract/src/types.ts:451](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L451)

Expected response format. Defaults to `"json"`.

***

### transformRequest()?

> `optional` **transformRequest**: (`input`, `url`) => [`TransformedRequest`](TransformedRequest.md)

Defined in: [packages/contract/src/types.ts:464](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L464)

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

Defined in: [packages/contract/src/types.ts:469](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L469)

Transforms the raw API response before returning to the caller.
Useful for mapping server field names to client-side conventions.

#### Parameters

##### raw

`unknown`

#### Returns

`unknown`
