[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / ApiError

# Class: ApiError

Defined in: [packages/contract/src/helpers/api-error.ts:1](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/helpers/api-error.ts#L1)

## Extends

- `Error`

## Constructors

### Constructor

> **new ApiError**(`status`, `body`): `ApiError`

Defined in: [packages/contract/src/helpers/api-error.ts:2](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/helpers/api-error.ts#L2)

#### Parameters

##### status

`number`

HTTP status code of the failed response.

##### body

`string`

Raw response body text.

#### Returns

`ApiError`

#### Overrides

`Error.constructor`

## Properties

### body

> `readonly` **body**: `string`

Defined in: [packages/contract/src/helpers/api-error.ts:6](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/helpers/api-error.ts#L6)

Raw response body text.

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

### status

> `readonly` **status**: `number`

Defined in: [packages/contract/src/helpers/api-error.ts:4](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/helpers/api-error.ts#L4)

HTTP status code of the failed response.
