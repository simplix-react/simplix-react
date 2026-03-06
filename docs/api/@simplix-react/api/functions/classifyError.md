[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/api](../README.md) / classifyError

# Function: classifyError()

> **classifyError**(`error`): [`ServerErrorEvent`](../interfaces/ServerErrorEvent.md)

Defined in: [packages/api/src/error-utils.ts:245](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/error-utils.ts#L245)

Classify an error into a structured [ServerErrorEvent](../interfaces/ServerErrorEvent.md).

## Parameters

### error

`unknown`

Any caught error value.

## Returns

[`ServerErrorEvent`](../interfaces/ServerErrorEvent.md)

A structured [ServerErrorEvent](../interfaces/ServerErrorEvent.md) with category, status, message, and validation errors.

## Remarks

Classification logic:
- `TypeError` without status → `"network"`.
- 401/403 → `"auth"`.
- 5xx → `"server"`.
- 4xx with validation errors → `"validation"`.
- 4xx without validation errors → `"client"`.
- Everything else → `"unknown"`.

## Example

```ts
const event = classifyError(err);
if (event.category === "validation") {
  setFieldErrors(event.validationErrors);
}
```
