[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / mockSuccess

# Function: mockSuccess()

> **mockSuccess**\<`T`\>(`data`): [`MockResult`](../interfaces/MockResult.md)\<`T`\>

Defined in: [mock-result.ts:47](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/mock/src/mock-result.ts#L47)

Creates a successful [MockResult](../interfaces/MockResult.md) wrapping the given data.

## Type Parameters

### T

`T`

The type of the data payload.

## Parameters

### data

`T`

The data to wrap in a success result.

## Returns

[`MockResult`](../interfaces/MockResult.md)\<`T`\>

A [MockResult](../interfaces/MockResult.md) with `success: true` and the provided data.

## Example

```ts
import { mockSuccess } from "@simplix-react/mock";

const result = mockSuccess({ id: "1", title: "My Task" });
// { success: true, data: { id: "1", title: "My Task" } }
```
