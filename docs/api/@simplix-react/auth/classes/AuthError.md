[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / AuthError

# Class: AuthError

Defined in: [packages/auth/src/errors.ts:27](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/errors.ts#L27)

Error thrown by auth operations.

Extends the native `Error` with a typed [AuthErrorCode](../type-aliases/AuthErrorCode.md) for
programmatic error handling.

## Example

```ts
try {
  await auth.fetchFn("/api/data");
} catch (error) {
  if (error instanceof AuthError && error.code === "REFRESH_FAILED") {
    redirectToLogin();
  }
}
```

## Extends

- `Error`

## Constructors

### Constructor

> **new AuthError**(`code`, `message`, `options?`): `AuthError`

Defined in: [packages/auth/src/errors.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/errors.ts#L30)

#### Parameters

##### code

[`AuthErrorCode`](../type-aliases/AuthErrorCode.md)

Typed error code for programmatic handling.

##### message

`string`

##### options?

Original error that caused this failure.

###### cause?

`unknown`

#### Returns

`AuthError`

#### Overrides

`Error.constructor`

## Properties

### cause?

> `optional` **cause**: `unknown`

Defined in: [node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:26](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/lib/lib.es2022.error.d.ts#L26)

#### Inherited from

`Error.cause`

***

### code

> `readonly` **code**: [`AuthErrorCode`](../type-aliases/AuthErrorCode.md)

Defined in: [packages/auth/src/errors.ts:32](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/errors.ts#L32)

Typed error code for programmatic handling.

***

### message

> **message**: `string`

Defined in: [node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1077](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/lib/lib.es5.d.ts#L1077)

#### Inherited from

`Error.message`

***

### name

> `readonly` **name**: `"AuthError"` = `"AuthError"`

Defined in: [packages/auth/src/errors.ts:28](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/errors.ts#L28)

#### Overrides

`Error.name`

***

### stack?

> `optional` **stack**: `string`

Defined in: [node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1078](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/lib/lib.es5.d.ts#L1078)

#### Inherited from

`Error.stack`
