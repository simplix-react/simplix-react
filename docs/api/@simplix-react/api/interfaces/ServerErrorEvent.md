[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/api](../README.md) / ServerErrorEvent

# Interface: ServerErrorEvent

Defined in: [packages/api/src/error-utils.ts:52](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/error-utils.ts#L52)

Structured error event produced by [classifyError](../functions/classifyError.md).

## Remarks

Consumed by the category-specific handlers in [createMutationErrorHandler](../functions/createMutationErrorHandler.md).

## Properties

### category

> **category**: [`ErrorCategory`](../type-aliases/ErrorCategory.md)

Defined in: [packages/api/src/error-utils.ts:54](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/error-utils.ts#L54)

Classification category of the error.

***

### errorCode?

> `optional` **errorCode**: `string`

Defined in: [packages/api/src/error-utils.ts:58](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/error-utils.ts#L58)

Application-specific error code (e.g. `"PET_NOT_FOUND"`).

***

### message

> **message**: `string`

Defined in: [packages/api/src/error-utils.ts:60](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/error-utils.ts#L60)

Human-readable error message.

***

### raw

> **raw**: `unknown`

Defined in: [packages/api/src/error-utils.ts:64](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/error-utils.ts#L64)

Original error object for debugging.

***

### status?

> `optional` **status**: `number`

Defined in: [packages/api/src/error-utils.ts:56](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/error-utils.ts#L56)

HTTP status code, if available.

***

### validationErrors?

> `optional` **validationErrors**: [`ValidationFieldError`](ValidationFieldError.md)[]

Defined in: [packages/api/src/error-utils.ts:62](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/error-utils.ts#L62)

Field-level validation errors, present only for `"validation"` category.
