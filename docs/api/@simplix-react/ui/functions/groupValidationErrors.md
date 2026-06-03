[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / groupValidationErrors

# Function: groupValidationErrors()

> **groupValidationErrors**(`error`): `Record`\<`string`, `string`\> \| `null`

Defined in: [packages/ui/src/crud/form/group-validation-errors.ts:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/group-validation-errors.ts#L22)

Extract and group server-side validation errors by field name.

Uses `getValidationErrors` from `@simplix-react/api` to extract field errors,
then groups them into a `Record<string, string>` keyed by field name.
Multiple messages for the same field are comma-joined to match the
`fieldErrors: Record<string, string>` shape used by `useCrudFormSubmit`
and all form field components.

## Parameters

### error

`unknown`

Any caught error value (typically from a mutation `onError`).

## Returns

`Record`\<`string`, `string`\> \| `null`

A record mapping field names to their error message string, or `null`
  if no validation errors were found.

## Example

```ts
const grouped = groupValidationErrors(error);
// { email: "must be valid, already taken", name: "is required" }
```
