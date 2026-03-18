[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/api](../README.md) / HttpError

# Class: HttpError

Defined in: [packages/api/src/index.ts:29](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/index.ts#L29)

HTTP error with status code and optional response data.

## Remarks

Thrown by mutator implementations when the server returns a non-2xx response.
The `status` field enables error classification via [classifyError](../functions/classifyError.md).

## Example

```ts
throw new HttpError(404, "Pet not found", { errorCode: "PET_NOT_FOUND" });
```

## Extends

- `Error`

## Constructors

### Constructor

> **new HttpError**(`status`, `message`, `data?`): `HttpError`

Defined in: [packages/api/src/index.ts:35](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/index.ts#L35)

#### Parameters

##### status

`number`

HTTP status code (e.g. 400, 401, 500).

##### message

`string`

Human-readable error message.

##### data?

`unknown`

Optional response body or structured error payload.

#### Returns

`HttpError`

#### Overrides

`Error.constructor`

## Properties

### cause?

> `optional` **cause**: `unknown`

Defined in: [node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:26](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/lib/lib.es2022.error.d.ts#L26)

#### Inherited from

`Error.cause`

***

### data?

> `readonly` `optional` **data**: `unknown`

Defined in: [packages/api/src/index.ts:38](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/index.ts#L38)

Optional response body or structured error payload.

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

### status

> `readonly` **status**: `number`

Defined in: [packages/api/src/index.ts:36](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/index.ts#L36)

HTTP status code (e.g. 400, 401, 500).
