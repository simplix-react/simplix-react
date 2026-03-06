[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / mapServerErrorsToForm

# Function: mapServerErrorsToForm()

> **mapServerErrorsToForm**(`error`, `form`): `boolean`

Defined in: [utils/server-error-mapping.ts:37](https://github.com/simplix-react/simplix-react/blob/main/utils/server-error-mapping.ts#L37)

Maps server validation errors to TanStack Form field errors using duck typing.

## Parameters

### error

`unknown`

The error thrown by the mutation (any type)

### form

`AnyFormApi`

The TanStack Form instance to set field errors on

## Returns

`boolean`

`true` if validation errors were mapped, `false` otherwise

## Remarks

Delegates to `getValidationErrors()` from `@simplix-react/api` for extraction,
then sets per-field error messages into each field's `errorMap.onSubmit` slot.

Supports:
- **Spring Boot:** `{ errorDetail: [{ field, message }] }`
- **JSON:API-like:** `{ errors: [{ field, message }] }`
- **Rails:** `{ errors: { [field]: string[] } }`

## Example

```ts
import { mapServerErrorsToForm } from "@simplix-react/form";

try {
  await mutation.mutateAsync(data);
} catch (error) {
  const mapped = mapServerErrorsToForm(error, form);
  if (!mapped) {
    // Not a validation error -- handle differently
  }
}
```
