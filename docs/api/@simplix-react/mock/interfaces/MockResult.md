[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / MockResult

# Interface: MockResult\<T\>

Defined in: [mock-result.ts:26](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/mock/src/mock-result.ts#L26)

Represents the outcome of a mock repository operation.

Encapsulates either a successful result with data or a failure with an error code
and message. Used throughout `@simplix-react/mock` to provide consistent return
types from all database operations.

## Example

```ts
import type { MockResult } from "@simplix-react/mock";

function handleResult(result: MockResult<{ id: string; name: string }>) {
  if (result.success) {
    console.log(result.data?.name);
  } else {
    console.error(result.error?.code, result.error?.message);
  }
}
```

## See

 - [mockSuccess](../functions/mockSuccess.md) - Creates a successful result.
 - [mockFailure](../functions/mockFailure.md) - Creates a failure result.

## Type Parameters

### T

`T`

The type of the data payload on success.

## Properties

### data?

> `optional` **data**: `T`

Defined in: [mock-result.ts:28](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/mock/src/mock-result.ts#L28)

***

### error?

> `optional` **error**: `object`

Defined in: [mock-result.ts:29](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/mock/src/mock-result.ts#L29)

#### code

> **code**: `string`

#### message

> **message**: `string`

***

### success

> **success**: `boolean`

Defined in: [mock-result.ts:27](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/mock/src/mock-result.ts#L27)
