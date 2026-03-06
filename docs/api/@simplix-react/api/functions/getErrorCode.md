[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/api](../README.md) / getErrorCode

# Function: getErrorCode()

> **getErrorCode**(`error`): `string` \| `null`

Defined in: [packages/api/src/error-utils.ts:195](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/error-utils.ts#L195)

Extract an application-specific error code from any error value.

## Parameters

### error

`unknown`

Any caught error value.

## Returns

`string` \| `null`

The error code string, or `null` if not found.

## Remarks

Looks for `errorCode` on the error object itself, then on `error.data`.
