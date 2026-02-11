[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / OperationDefinition

# Interface: OperationDefinition\<TInput, TOutput\>

Defined in: [packages/contract/src/types.ts:126](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/contract/src/types.ts#L126)

Defines a custom (non-CRUD) API operation with typed input and output.

Covers endpoints that do not fit the standard entity CRUD pattern, such as
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

[EntityDefinition](EntityDefinition.md) for standard CRUD entities.

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

Defined in: [packages/contract/src/types.ts:139](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/contract/src/types.ts#L139)

Content type for the request body. Defaults to `"json"`.

***

### input

> **input**: `TInput`

Defined in: [packages/contract/src/types.ts:135](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/contract/src/types.ts#L135)

Zod schema validating the request payload.

***

### invalidates()?

> `optional` **invalidates**: (`queryKeys`, `params`) => readonly `unknown`[][]

Defined in: [packages/contract/src/types.ts:146](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/contract/src/types.ts#L146)

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

Defined in: [packages/contract/src/types.ts:131](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/contract/src/types.ts#L131)

HTTP method for this operation.

***

### output

> **output**: `TOutput`

Defined in: [packages/contract/src/types.ts:137](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/contract/src/types.ts#L137)

Zod schema validating the response payload.

***

### path

> **path**: `string`

Defined in: [packages/contract/src/types.ts:133](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/contract/src/types.ts#L133)

URL path with optional `:paramName` placeholders (e.g. `"/tasks/:taskId/assign"`).

***

### responseType?

> `optional` **responseType**: `"json"` \| `"blob"`

Defined in: [packages/contract/src/types.ts:141](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/contract/src/types.ts#L141)

Expected response format. Defaults to `"json"`.
