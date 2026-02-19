[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / OperationDefinition

# Interface: OperationDefinition\<TInput, TOutput\>

Defined in: [packages/contract/src/types.ts:230](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L230)

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

Defined in: [packages/contract/src/types.ts:243](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L243)

Content type for the request body. Defaults to `"json"`.

***

### input

> **input**: `TInput`

Defined in: [packages/contract/src/types.ts:239](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L239)

Zod schema validating the request payload.

***

### invalidates()?

> `optional` **invalidates**: (`queryKeys`, `params`) => readonly `unknown`[][]

Defined in: [packages/contract/src/types.ts:250](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L250)

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

Defined in: [packages/contract/src/types.ts:235](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L235)

HTTP method for this operation.

***

### output

> **output**: `TOutput`

Defined in: [packages/contract/src/types.ts:241](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L241)

Zod schema validating the response payload.

***

### path

> **path**: `string`

Defined in: [packages/contract/src/types.ts:237](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L237)

URL path with optional `:paramName` placeholders (e.g. `"/tasks/:taskId/assign"`).

***

### responseType?

> `optional` **responseType**: `"json"` \| `"blob"`

Defined in: [packages/contract/src/types.ts:245](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L245)

Expected response format. Defaults to `"json"`.
