[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / mapServerErrorsToForm

# Function: mapServerErrorsToForm()

> **mapServerErrorsToForm**(`error`, `form`): `void`

Defined in: [utils/server-error-mapping.ts:47](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/form/src/utils/server-error-mapping.ts#L47)

Maps 422 validation errors from the server to TanStack Form field errors.

## Parameters

### error

`unknown`

The error thrown by the mutation (any type)

### form

`AnyFormApi`

The TanStack Form instance to set field errors on

## Returns

`void`

## Remarks

Parses the `body` of an `ApiError` with status 422 and sets per-field
error messages into each field's `errorMap.onSubmit` slot.

Supports two server error formats:
- **Rails:** `{ errors: { [field]: string[] } }`
- **JSON:API:** `{ errors: [{ field, message }] }`

Non-`ApiError` instances, non-422 status codes, and unparseable bodies
are silently ignored (no-op).

## Example

```ts
import { mapServerErrorsToForm } from "@simplix-react/form";

try {
  await mutation.mutateAsync(data);
} catch (error) {
  mapServerErrorsToForm(error, form);
}
```

## See

[ApiError](../@simplix-react/contract/classes/ApiError.md) from `@simplix-react/contract`
