[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/api](../README.md) / ValidationFieldError

# Interface: ValidationFieldError

Defined in: [packages/api/src/error-utils.ts:11](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/error-utils.ts#L11)

A single field-level validation error returned by the server.

## Example

```ts
const err: ValidationFieldError = { field: "email", message: "must be valid" };
```

## Properties

### field

> **field**: `string`

Defined in: [packages/api/src/error-utils.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/error-utils.ts#L13)

The form field name that failed validation (e.g. `"email"`, `"name"`).

***

### message

> **message**: `string`

Defined in: [packages/api/src/error-utils.ts:15](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/error-utils.ts#L15)

Human-readable validation message for the field.
