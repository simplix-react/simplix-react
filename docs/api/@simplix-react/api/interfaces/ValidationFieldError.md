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

### label?

> `optional` **label**: `string`

Defined in: [packages/api/src/error-utils.ts:25](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/error-utils.ts#L25)

What the server calls that field, already in the request's locale.

#### Remarks

Sent by SimpliX backends from the DTO's `@FieldLabel`. It is the only readable name a client
has for a field its own form does not draw — a refusal naming `originalApproverName` is a
string the reader can do nothing with, and this is the same field called 「원 결재자」.
Optional because other server shapes (Rails-style `errors`) carry no label.

***

### message

> **message**: `string`

Defined in: [packages/api/src/error-utils.ts:15](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/error-utils.ts#L15)

Human-readable validation message for the field.
