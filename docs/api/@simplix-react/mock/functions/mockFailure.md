[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / mockFailure

# Function: mockFailure()

> **mockFailure**(`error`): [`MockResult`](../interfaces/MockResult.md)\<`never`\>

Defined in: [mock-result.ts:65](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/mock/src/mock-result.ts#L65)

Creates a failure [MockResult](../interfaces/MockResult.md) with the given error code and message.

## Parameters

### error

An object containing an error `code` and human-readable `message`.

#### code

`string`

#### message

`string`

## Returns

[`MockResult`](../interfaces/MockResult.md)\<`never`\>

A [MockResult](../interfaces/MockResult.md) with `success: false` and the provided error.

## Example

```ts
import { mockFailure } from "@simplix-react/mock";

const result = mockFailure({ code: "not_found", message: "Task not found" });
// { success: false, error: { code: "not_found", message: "Task not found" } }
```
