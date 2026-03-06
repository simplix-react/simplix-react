[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / ApiKeySchemeOptions

# Interface: ApiKeySchemeOptions

Defined in: [packages/auth/src/types.ts:179](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L179)

Options for [apiKeyScheme](../functions/apiKeyScheme.md).

## Properties

### in

> **in**: `"header"` \| `"query"`

Defined in: [packages/auth/src/types.ts:181](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L181)

Where to place the API key.

***

### key

> **key**: `string` \| () => `string` \| `null`

Defined in: [packages/auth/src/types.ts:187](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L187)

Static key string or function returning the current key.

***

### name

> **name**: `string`

Defined in: [packages/auth/src/types.ts:184](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L184)

Header name or query parameter name (e.g., `"X-API-Key"`).
