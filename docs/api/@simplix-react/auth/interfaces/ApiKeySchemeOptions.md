[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / ApiKeySchemeOptions

# Interface: ApiKeySchemeOptions

Defined in: [packages/auth/src/types.ts:145](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/auth/src/types.ts#L145)

Options for [apiKeyScheme](../functions/apiKeyScheme.md).

## Properties

### in

> **in**: `"header"` \| `"query"`

Defined in: [packages/auth/src/types.ts:147](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/auth/src/types.ts#L147)

Where to place the API key.

***

### key

> **key**: `string` \| () => `string` \| `null`

Defined in: [packages/auth/src/types.ts:153](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/auth/src/types.ts#L153)

Static key string or function returning the current key.

***

### name

> **name**: `string`

Defined in: [packages/auth/src/types.ts:150](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/auth/src/types.ts#L150)

Header name or query parameter name (e.g., `"X-API-Key"`).
