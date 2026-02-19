[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / AccessAdapter

# Interface: AccessAdapter\<TActions, TSubjects\>

Defined in: [packages/access/src/types.ts:182](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L182)

Defines how to extract access rules from an authentication data source.

## Remarks

Adapters bridge the gap between auth providers (JWT, API, static config)
and the CASL-based access policy. Implement this interface to support
custom auth sources.

## Example

```ts
const adapter: AccessAdapter = {
  async extract(authData) {
    const token = authData as string;
    const claims = decodeJwt(token);
    return { rules: claims.permissions, user: claims.user, roles: claims.roles };
  },
};
```

## See

 - [createJwtAdapter](../functions/createJwtAdapter.md) for JWT-based extraction.
 - [createApiAdapter](../functions/createApiAdapter.md) for API endpoint-based extraction.
 - [createStaticAdapter](../functions/createStaticAdapter.md) for hardcoded rules.

## Type Parameters

### TActions

`TActions` *extends* `string` = `string`

Action verb union.

### TSubjects

`TSubjects` *extends* `string` = `string`

Subject name union.

## Methods

### extract()

> **extract**(`authData`): `Promise`\<[`AccessExtractResult`](AccessExtractResult.md)\<`TActions`, `TSubjects`\>\>

Defined in: [packages/access/src/types.ts:191](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L191)

Extracts access rules, user info, and roles from the given auth data.

#### Parameters

##### authData

`unknown`

Raw auth data (e.g., JWT string, API response).

#### Returns

`Promise`\<[`AccessExtractResult`](AccessExtractResult.md)\<`TActions`, `TSubjects`\>\>
