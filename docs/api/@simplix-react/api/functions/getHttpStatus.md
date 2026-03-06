[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/api](../README.md) / getHttpStatus

# Function: getHttpStatus()

> **getHttpStatus**(`error`): `number` \| `null`

Defined in: [packages/api/src/error-utils.ts:215](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/error-utils.ts#L215)

Extract the HTTP status code from any error with a numeric `status` property.

## Parameters

### error

`unknown`

Any caught error value.

## Returns

`number` \| `null`

The numeric status code, or `null` if not present.
