[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/api](../README.md) / getValidationErrors

# Function: getValidationErrors()

> **getValidationErrors**(`error`): [`ValidationFieldError`](../interfaces/ValidationFieldError.md)[] \| `null`

Defined in: [packages/api/src/error-utils.ts:144](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/error-utils.ts#L144)

Extract validation field errors from any error shape using duck typing.

## Parameters

### error

`unknown`

Any caught error value.

## Returns

[`ValidationFieldError`](../interfaces/ValidationFieldError.md)[] \| `null`

Array of field errors, or `null` if none found.

## Remarks

Supports multiple server error formats:
1. Direct properties (`errorDetail`, `errors`) — Spring Boot / ApiResponseError.
2. `error.data` — [HttpError](../classes/HttpError.md) shape.
3. `JSON.parse(error.body)` — ApiError with string body.
4. Rails-style `{ errors: { [field]: string[] } }`.

## Example

```ts
try {
  await createPet(data);
} catch (err) {
  const fieldErrors = getValidationErrors(err);
  // [{ field: "name", message: "is required" }]
}
```
