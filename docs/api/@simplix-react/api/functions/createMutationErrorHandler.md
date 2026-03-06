[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/api](../README.md) / createMutationErrorHandler

# Function: createMutationErrorHandler()

> **createMutationErrorHandler**(`config`): (`error`, `variables?`, `context?`) => `void`

Defined in: [packages/api/src/error-utils.ts:339](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/error-utils.ts#L339)

Create a React Query `onError` handler that routes errors to category-specific callbacks.

## Parameters

### config

Map of category-specific error handlers. All callbacks are optional.

#### onAuthError?

(`event`) => `void`

#### onClientError?

(`event`) => `void`

#### onNetworkError?

(`event`) => `void`

#### onServerError?

(`event`) => `void`

#### onUnknownError?

(`event`) => `void`

#### onValidationError?

(`event`) => `void`

## Returns

An `onError` function compatible with React Query mutation options.

> (`error`, `variables?`, `context?`): `void`

### Parameters

#### error

`Error`

#### variables?

`unknown`

#### context?

`unknown`

### Returns

`void`

## Remarks

Uses [classifyError](classifyError.md) internally, then dispatches to the matching
`on*Error` callback. Designed for use with `useMutation({ onError })`.

## Example

```ts
const onError = createMutationErrorHandler({
  onValidationError: (e) => setFieldErrors(e.validationErrors),
  onAuthError: () => router.push("/login"),
  onServerError: (e) => toast.error(e.message),
});

useMutation({ mutationFn: createPet, onError });
```
