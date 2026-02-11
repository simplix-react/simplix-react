[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / ApiKeySchemeOptions

# Interface: ApiKeySchemeOptions

Defined in: [packages/auth/src/types.ts:145](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/auth/src/types.ts#L145)

Options for [apiKeyScheme](../functions/apiKeyScheme.md).

## Properties

### in

> **in**: `"header"` \| `"query"`

Defined in: [packages/auth/src/types.ts:147](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/auth/src/types.ts#L147)

Where to place the API key.

***

### key

> **key**: `string` \| () => `string` \| `null`

Defined in: [packages/auth/src/types.ts:153](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/auth/src/types.ts#L153)

Static key string or function returning the current key.

***

### name

> **name**: `string`

Defined in: [packages/auth/src/types.ts:150](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/auth/src/types.ts#L150)

Header name or query parameter name (e.g., `"X-API-Key"`).
