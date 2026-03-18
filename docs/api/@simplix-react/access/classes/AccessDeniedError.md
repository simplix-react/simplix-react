[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / AccessDeniedError

# Class: AccessDeniedError

Defined in: [packages/access/src/errors.ts:23](https://github.com/simplix-react/simplix-react/blob/main/packages/access/src/errors.ts#L23)

Thrown when an access check fails.

## Remarks

Used by `requireAccess` in route guards. Catch this error
in TanStack Router's `onError` or a global error boundary to
redirect unauthorized users.

## Example

```ts
import { AccessDeniedError } from "@simplix-react/access";

try {
  requireAccess(policy, { action: "delete", subject: "Pet" });
} catch (error) {
  if (error instanceof AccessDeniedError) {
    console.log(error.action);  // "delete"
    console.log(error.subject); // "Pet"
  }
}
```

## Extends

- `Error`

## Constructors

### Constructor

> **new AccessDeniedError**(`action`, `subject`): `AccessDeniedError`

Defined in: [packages/access/src/errors.ts:33](https://github.com/simplix-react/simplix-react/blob/main/packages/access/src/errors.ts#L33)

#### Parameters

##### action

`string`

The action that was denied.

##### subject

`string`

The subject the action was attempted on.

#### Returns

`AccessDeniedError`

#### Overrides

`Error.constructor`

## Properties

### action

> `readonly` **action**: `string`

Defined in: [packages/access/src/errors.ts:25](https://github.com/simplix-react/simplix-react/blob/main/packages/access/src/errors.ts#L25)

The action that was denied.

***

### cause?

> `optional` **cause**: `unknown`

Defined in: [node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:26](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/lib/lib.es2022.error.d.ts#L26)

#### Inherited from

`Error.cause`

***

### message

> **message**: `string`

Defined in: [node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1077](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/lib/lib.es5.d.ts#L1077)

#### Inherited from

`Error.message`

***

### name

> **name**: `string`

Defined in: [node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1076](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/lib/lib.es5.d.ts#L1076)

#### Inherited from

`Error.name`

***

### stack?

> `optional` **stack**: `string`

Defined in: [node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1078](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/lib/lib.es5.d.ts#L1078)

#### Inherited from

`Error.stack`

***

### subject

> `readonly` **subject**: `string`

Defined in: [packages/access/src/errors.ts:27](https://github.com/simplix-react/simplix-react/blob/main/packages/access/src/errors.ts#L27)

The subject the action was attempted on.
